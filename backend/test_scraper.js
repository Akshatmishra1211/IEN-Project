const { chromium } = require('playwright');

async function runTest() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to product 1...');
  await page.goto('https://demo.inelabteamdev.com/product/1', { waitUntil: 'networkidle' });

  // Accept cookies
  try {
    const accept = page.locator('button:has-text("ACCEPT")');
    if (await accept.isVisible({ timeout: 2000 })) {
      await accept.click();
      console.log('Accepted cookies.');
    }
  } catch (e) {}

  const priceBlock = page.locator('.price-block');
  const box = await priceBlock.boundingBox();
  console.log('Price block bounding box:', box);

  // Hover into price block
  const startX = box.x + 50;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.waitForTimeout(50);

  // Perform mouse moves with >40ms gap
  console.log('Performing mouse moves...');
  for (let i = 0; i < 15; i++) {
    const x = startX + (i * 15);
    const y = startY + (i % 2 === 0 ? 5 : -5);
    await page.mouse.move(x, y);
    await page.waitForTimeout(60); // 60ms gap (> 40ms threshold)
  }

  // Dwell for > 600ms
  console.log('Waiting for dwell time...');
  await page.waitForTimeout(700);

  // Check reveal button state
  const btn = page.locator('button[aria-label="Reveal price"]');
  console.log('Button exists:', await btn.count());
  console.log('Button disabled attribute:', await btn.getAttribute('disabled'));

  // Wait specifically for button to NOT be disabled
  console.log('Waiting for button to become enabled...');
  await page.waitForSelector('button[aria-label="Reveal price"]:not([disabled])', { timeout: 5000 });
  console.log('Button is now ENABLED!');

  // Click enabled button
  console.log('Clicking button...');
  await btn.click();

  // Wait for success
  console.log('Waiting for .price-success...');
  await page.waitForSelector('.price-block.price-success', { timeout: 15000 });
  console.log('SUCCESS!');

  const text = await page.locator('.price-block.price-success').innerText();
  console.log('Revealed text:\n', text);

  await browser.close();
}

runTest().catch(console.error);
