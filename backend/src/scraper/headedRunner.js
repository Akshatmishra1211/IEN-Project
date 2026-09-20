const { scrapeProduct } = require('./mockStoreScraper');

async function runHeadedDemo() {
  const args = process.argv.slice(2);
  const productId = args[0] || '155'; // Default product: Nordkraft Recovery Slide Mini

  console.log('====================================================');
  console.log(' INE STORE SCRAPER - HEADED DEMO (OBSERVABLE RUN) ');
  console.log('====================================================');
  console.log(`Target Product ID: ${productId}`);
  console.log('Launching browser in HEADED mode (visible UI window)...');

  try {
    const result = await scrapeProduct(productId, { headed: true, maxRetries: 3 });
    console.log('\n====================================================');
    console.log(' SCRAPE RESULT SUMMARY');
    console.log('====================================================');
    console.log(`Status            : ${result.status}`);
    console.log(`Price Found       : ₹${result.price}`);
    console.log(`Stock Status      : ${result.stock}`);
    console.log(`Total Attempts    : ${result.attempts}`);
    console.log(`Duration          : ${result.duration_ms} ms`);
    console.log(`Structure Shift   : ${result.structure_changed}`);
    if (result.error_message) {
      console.log(`Error Message     : ${result.error_message}`);
    }
    console.log('====================================================\n');
  } catch (err) {
    console.error('Fatal error during headed run:', err);
  }
}

if (require.main === module) {
  runHeadedDemo();
}

module.exports = { runHeadedDemo };
