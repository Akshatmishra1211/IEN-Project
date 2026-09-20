const { chromium } = require('playwright');

/**
 * Scrapes a single product from INE's hosted mock store (https://demo.inelabteamdev.com).
 *
 * Anti-scraping challenges handled:
 * 1. Cookie consent overlay must be dismissed first
 * 2. Price is behind a "Reveal price" button that starts DISABLED
 * 3. Button requires: ≥8 mouse moves (throttled at 40ms) + ≥600ms hover dwell time
 * 4. After click, WASM proof-of-work + encrypted token exchange occurs
 * 5. Price renders asynchronously after network round-trip
 *
 * @param {number|string} mockProductId  Product ID (e.g. 155)
 * @param {object} options  { headed: boolean, maxRetries: number }
 */
async function scrapeProduct(mockProductId, options = {}) {
  const headed = options.headed || false;
  const maxRetries = options.maxRetries || 3;
  const targetUrl = `https://demo.inelabteamdev.com/product/${mockProductId}`;

  let attempts = 0;
  let lastError = null;
  const startTime = Date.now();
  let browser = null;

  while (attempts < maxRetries) {
    attempts++;
    console.log(`[Scraper] Attempt ${attempts}/${maxRetries} for Product #${mockProductId}...`);

    try {
      browser = await chromium.launch({
        headless: !headed,
        slowMo: headed ? 80 : 0,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        locale: 'en-IN'
      });

      const page = await context.newPage();

      // Navigate to product detail page
      const response = await page.goto(targetUrl, {
        waitUntil: 'networkidle',
        timeout: 25000
      });

      if (!response || response.status() >= 400) {
        throw new Error(`HTTP ${response ? response.status() : 'no response'} loading ${targetUrl}`);
      }

      // Step 1: Dismiss cookie consent if present
      try {
        const acceptBtn = page.locator('button:has-text("ACCEPT")').first();
        await acceptBtn.waitFor({ state: 'visible', timeout: 3000 });
        await acceptBtn.click();
        await page.waitForTimeout(300);
        console.log('[Scraper] Dismissed cookie consent.');
      } catch {
        // No cookie banner — fine
      }

      // Step 2: Locate the price-block container and scroll into view
      const priceBlock = page.locator('.price-block').first();
      await priceBlock.waitFor({ state: 'visible', timeout: 5000 });
      await priceBlock.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);

      const box = await priceBlock.boundingBox();
      if (!box) throw new Error('Could not get bounding box for price-block');

      // Step 3: Satisfy the anti-bot interaction requirements
      // Need: mouseenter event, then ≥8 mousemove events spaced ≥40ms apart,
      // and total hover dwell time ≥ 600ms.
      const startX = box.x + 20;
      const centerY = box.y + box.height / 2;
      const sweepWidth = Math.max(box.width - 40, 100);

      await page.mouse.move(startX, centerY);
      await page.waitForTimeout(60);

      // Perform 15 mouse moves across the full price area width, 60ms apart (>40ms requirement)
      for (let i = 0; i < 15; i++) {
        const x = startX + (i * (sweepWidth / 14));
        const y = centerY + (i % 2 === 0 ? 6 : -6);
        await page.mouse.move(x, y);
        await page.waitForTimeout(60);
      }

      // Dwell for > 600ms
      await page.waitForTimeout(700);

      // Step 4: Locate button and ensure disabled attribute is cleared
      const revealBtn = page.locator('button[aria-label="Reveal price"]');
      await revealBtn.waitFor({ state: 'visible', timeout: 5000 });

      // If button is still disabled, perform active micro-moves until React re-renders (250ms interval)
      let checkAttempts = 0;
      while (await revealBtn.getAttribute('disabled') !== null && checkAttempts < 10) {
        checkAttempts++;
        await page.mouse.move(startX + (checkAttempts * 10), centerY + (checkAttempts % 2 === 0 ? 4 : -4));
        await page.waitForTimeout(200);
      }

      await revealBtn.click();
      console.log('[Scraper] Clicked "Reveal price" button.');

      // Step 5: Wait for price to load (server round-trip + WASM computation)
      // The price-block changes class to price-success on completion
      await page.waitForSelector('.price-block.price-success, .price-block.price-error', {
        timeout: 15000
      });

      // Check if we got an error
      const isError = await page.locator('.price-block.price-error').count();
      if (isError > 0) {
        const errorMsg = await page.locator('.price-block.price-error .price-substatus').innerText().catch(() => 'Unknown error');
        throw new Error(`Store returned error: ${errorMsg}`);
      }

      // Step 6: Extract price from rendered DOM
      let priceText = null;
      let mrpText = null;
      let stockText = 'Unknown';

      // Main price value (the large displayed price)
      const successBlock = page.locator('.price-block.price-success');

      // Get the main visible price text from the price-main area
      const priceMain = successBlock.locator('.price-main');
      const mainText = await priceMain.innerText();
      // Clean zero-width characters (e.g. \u200B) inserted by store anti-scraping obfuscation
      const cleanMainText = mainText.replace(/[\u200B-\u200D\uFEFF]/g, '');
      console.log('[Scraper] Price main text (cleaned):', cleanMainText);

      // Extract ₹ values from the text (use [ \t] instead of \s so newlines are not matched)
      const priceMatches = cleanMainText.match(/₹[ \t\d,]+(?:\.\d+)?/g);
      if (priceMatches && priceMatches.length >= 1) {
        // First ₹ value is MRP (strikethrough), second is actual selling price
        if (priceMatches.length >= 2) {
          mrpText = priceMatches[0]; // MRP (strikethrough)
          priceText = priceMatches[1]; // Current selling price
        } else {
          priceText = priceMatches[0];
        }
      }

      // Extract stock text from stock-badge
      try {
        const stockEl = page.locator('.stock-badge').first();
        if (await stockEl.isVisible({ timeout: 2000 })) {
          stockText = await stockEl.innerText();
        }
      } catch {
        // Stock element may not be visible in some layouts
      }

      // Parse numeric value
      let priceNumeric = null;
      if (priceText) {
        const cleaned = priceText.replace(/[^\d.]/g, '');
        if (cleaned) priceNumeric = parseFloat(cleaned);
      }

      let mrpNumeric = null;
      if (mrpText) {
        const cleaned = mrpText.replace(/[^\d.]/g, '');
        if (cleaned) mrpNumeric = parseFloat(cleaned);
      }

      await browser.close();
      browser = null;

      const durationMs = Date.now() - startTime;

      if (priceNumeric === null || isNaN(priceNumeric)) {
        throw new Error('Could not parse numeric price from extracted text');
      }

      console.log(`[Scraper] ✓ Price: ₹${priceNumeric}, MRP: ₹${mrpNumeric}, Stock: ${stockText}`);

      return {
        price: priceNumeric,
        mrp: mrpNumeric,
        stock: stockText,
        currency: 'INR',
        status: attempts > 1 ? 'RETRIED' : 'SUCCESS',
        attempts,
        duration_ms: durationMs,
        error_message: null,
        structure_changed: false
      };

    } catch (err) {
      lastError = err;
      console.warn(`[Scraper] Attempt ${attempts} failed:`, err.message);

      if (browser) {
        await browser.close().catch(() => {});
        browser = null;
      }

      if (attempts < maxRetries) {
        const backoffMs = Math.pow(2, attempts) * 1000;
        console.log(`[Scraper] Waiting ${backoffMs}ms before retry...`);
        await new Promise(r => setTimeout(r, backoffMs));
      }
    }
  }

  const durationMs = Date.now() - startTime;
  return {
    price: null,
    mrp: null,
    stock: null,
    currency: 'INR',
    status: 'FAILED',
    attempts,
    duration_ms: durationMs,
    error_message: lastError ? lastError.message : 'Scraping failed after retries',
    structure_changed: false
  };
}

module.exports = { scrapeProduct };
