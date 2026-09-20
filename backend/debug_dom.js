const { chromium } = require('playwright');

async function debugPageContent() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Navigating to product 155...');
  await page.goto('https://demo.inelabteamdev.com/product/155', { waitUntil: 'domcontentloaded' });
  
  await page.waitForTimeout(4000);

  const title = await page.title();
  const text = await page.innerText('body');
  const buttons = await page.locator('button').allInnerTexts();
  const inputs = await page.locator('input').all();
  
  console.log('--- PAGE TITLE ---', title);
  console.log('--- BUTTONS ---', buttons);
  console.log('--- BODY TEXT SAMPLE (1500 chars) ---');
  console.log(text.slice(0, 1500));

  // Print all elements containing numbers or symbols
  const allDivs = await page.locator('div, span, p').allInnerTexts();
  const priceLike = allDivs.filter(t => t.includes('₹') || t.includes('$') || t.includes('Price') || t.includes('Stock'));
  console.log('--- PRICE/STOCK LIKE ELEMENTS ---', priceLike.slice(0, 20));
  
  await browser.close();
}

debugPageContent();
