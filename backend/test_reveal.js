const { chromium } = require('playwright');

async function testRevealWithMouseMove() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Navigating...');
  await page.goto('https://demo.inelabteamdev.com/product/155', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Dismiss Cookie Banner if any
  const cookieBtn = page.locator('button:has-text("ACCEPT")').first();
  if (await cookieBtn.isVisible().catch(() => false)) {
    await cookieBtn.click();
    await page.waitForTimeout(300);
  }

  // 2. Locate the price area
  const priceContainer = page.locator('div:has-text("Price hidden"), div:has-text("REVEAL PRICE")').first();
  const box = await priceContainer.boundingBox();
  console.log('Price container bounding box:', box);

  if (box) {
    // Perform mouse movements across the container to populate telemetry (moves array)
    const startX = box.x + 10;
    const startY = box.y + 10;
    
    for (let i = 0; i < 20; i++) {
      await page.mouse.move(startX + (i * 15), startY + (i % 5 * 5));
      await page.waitForTimeout(50);
    }
    
    // Hover over center and click REVEAL PRICE
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(200);

    const revealBtn = page.locator('button:has-text("REVEAL PRICE")').first();
    if (await revealBtn.isVisible().catch(() => false)) {
      await revealBtn.click();
      console.log('Clicked reveal button');
    }
  }

  // 3. Wait up to 5s for price to load
  console.log('Waiting for price to appear...');
  for (let s = 0; s < 10; s++) {
    await page.waitForTimeout(500);
    const bodyText = await page.innerText('body');
    if (bodyText.includes('₹') || bodyText.includes('INR') || /\d{3,}/.test(bodyText)) {
      const priceLines = bodyText.split('\n').filter(l => l.includes('₹') || l.includes('In stock') || l.includes('Out of stock'));
      console.log(`[t=${s*0.5}s] Found Price/Stock lines:`, priceLines);
      if (priceLines.length > 0) break;
    }
  }

  await browser.close();
}

testRevealWithMouseMove();
