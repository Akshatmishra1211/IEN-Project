const { chromium } = require('playwright');

async function debugPageContent() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://demo.inelabteamdev.com/product/155', { waitUntil: 'networkidle' });
  
  // Wait 3 seconds
  await page.waitForTimeout(3000);

  const title = await page.title();
  const text = await page.innerText('body');
  const buttons = await page.locator('button').allInnerTexts();
  
  console.log('--- PAGE TITLE ---', title);
  console.log('--- BUTTONS ---', buttons);
  console.log('--- BODY TEXT SAMPLE ---');
  console.log(text.slice(0, 1500));
  
  await browser.close();
}

debugPageContent();
