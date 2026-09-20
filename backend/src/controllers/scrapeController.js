const { db } = require('../config/supabase');
const { runSingleScrape } = require('./productController');

// Trigger immediate manual scrape for a specific product
async function triggerScrapeProduct(req, res) {
  try {
    const { id } = req.params;
    const { headed } = req.query;

    const products = await db.getProducts();
    const product = products.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const isHeaded = headed === 'true' || headed === '1';
    console.log(`[ScrapeApi] Manual trigger requested for Product #${product.mock_product_id} (Headed: ${isHeaded})`);

    const result = await runSingleScrape(product.id, product.mock_product_id, isHeaded);

    res.json({
      success: true,
      message: `Scrape completed with status: ${result.status}`,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Scheduled Cron / Webhook endpoint to scrape all active tracked products
async function triggerScrapeAll(req, res) {
  try {
    const cronSecret = process.env.CRON_SECRET || 'my_super_secret_cron_token_123';
    const authHeader = req.headers['authorization'] || req.query.secret;

    if (authHeader && authHeader !== cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ success: false, error: 'Unauthorized cron secret' });
    }

    const products = await db.getProducts();
    const activeProducts = products.filter(p => p.is_active);

    console.log(`[CronScrape] Triggered scrape for ${activeProducts.length} active products...`);

    const results = [];
    for (const p of activeProducts) {
      const result = await runSingleScrape(p.id, p.mock_product_id, false);
      results.push({
        product_id: p.id,
        mock_product_id: p.mock_product_id,
        name: p.name,
        status: result.status,
        price: result.price,
        stock: result.stock
      });
    }

    res.json({
      success: true,
      total_scraped: results.length,
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get price history for chart display
async function getPriceHistory(req, res) {
  try {
    const { id } = req.params;
    const history = await db.getPriceHistory(id);
    res.json({
      success: true,
      history
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get scrape logs table
async function getScrapeLogs(req, res) {
  try {
    const { id } = req.params;
    const logs = await db.getScrapeLogs(id);
    res.json({
      success: true,
      logs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  triggerScrapeProduct,
  triggerScrapeAll,
  getPriceHistory,
  getScrapeLogs
};
