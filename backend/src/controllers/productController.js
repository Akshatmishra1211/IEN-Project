const axios = require('axios');
const { db } = require('../config/supabase');
const { scrapeProduct } = require('../scraper/mockStoreScraper');
const { sendAlertNotification } = require('../services/notificationService');

// Cache catalog items in memory for fast search
let cachedCatalog = [];
let lastCatalogFetch = 0;

async function fetchCatalog() {
  const now = Date.now();
  // Refresh cache every 10 minutes
  if (cachedCatalog.length > 0 && now - lastCatalogFetch < 600000) {
    return cachedCatalog;
  }

  try {
    const response = await axios.get('https://demo.inelabteamdev.com/api/catalog?page=1&pageSize=100', {
      timeout: 10000
    });
    if (response.data && response.data.items) {
      cachedCatalog = response.data.items;
      lastCatalogFetch = now;
      return cachedCatalog;
    }
  } catch (err) {
    console.warn('[Catalog] Error fetching mock store catalog API:', err.message);
  }
  return cachedCatalog;
}

// Search INE hosted store products by name, brand, category, or SKU
async function searchProducts(req, res) {
  try {
    const { query, category } = req.query;
    const catalog = await fetchCatalog();

    let results = catalog;

    if (query) {
      const q = query.toLowerCase().trim();
      results = results.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }

    if (category) {
      results = results.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    res.json({
      success: true,
      total: results.length,
      products: results.slice(0, 30) // Limit to top 30 search results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get all tracked products with latest price, history, and status
async function getTrackedProducts(req, res) {
  try {
    const products = await db.getProducts();

    // Attach latest price and logs to each product
    const enrichedProducts = await Promise.all(
      products.map(async p => {
        const history = await db.getPriceHistory(p.id);
        const logs = await db.getScrapeLogs(p.id);

        const latestHistory = history.length > 0 ? history[history.length - 1] : null;
        const latestLog = logs.length > 0 ? logs[0] : null;

        return {
          ...p,
          current_price: latestHistory ? latestHistory.price : null,
          current_stock: latestHistory ? latestHistory.stock : 'Unknown',
          mrp: latestHistory ? latestHistory.mrp : null,
          history_count: history.length,
          last_scraped_at: p.last_scraped_at || (latestLog ? latestLog.scraped_at : null),
          last_status: latestLog ? latestLog.status : p.last_status
        };
      })
    );

    res.json({
      success: true,
      products: enrichedProducts
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Add a product to tracking list
async function trackProduct(req, res) {
  try {
    const { mock_product_id, slug, name, brand, category, sku, description, scrape_interval_hours } = req.body;

    if (!mock_product_id || !name) {
      return res.status(400).json({ success: false, error: 'mock_product_id and name are required' });
    }

    const tracked = await db.addProduct({
      mock_product_id: parseInt(mock_product_id, 10),
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      brand: brand || '',
      category: category || 'General',
      sku: sku || `SKU-${mock_product_id}`,
      description: description || '',
      scrape_interval_hours: scrape_interval_hours || 2
    });

    // Trigger asynchronous initial scrape in background
    runSingleScrape(tracked.id, tracked.mock_product_id).catch(err => {
      console.error('[TrackProduct] Async initial scrape failed:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Product added to tracking list. Initial scrape scheduled.',
      product: tracked
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Untrack/Delete product
async function untrackProduct(req, res) {
  try {
    const { id } = req.params;
    const removed = await db.removeProduct(id);
    if (!removed) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product untracked successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Internal helper to perform a single scrape and store history + logs
async function runSingleScrape(productId, mockProductId, headed = false) {
  console.log(`[ScrapeWorker] Executing scrape for Product ID ${productId} (Mock #${mockProductId})...`);

  const scrapeResult = await scrapeProduct(mockProductId, { headed, maxRetries: 3 });

  // 1. Record scrape log honestly
  await db.addScrapeLog({
    product_id: productId,
    status: scrapeResult.status,
    attempts: scrapeResult.attempts,
    duration_ms: scrapeResult.duration_ms,
    price_found: scrapeResult.price,
    stock_found: scrapeResult.stock,
    error_message: scrapeResult.error_message,
    structure_changed: scrapeResult.structure_changed
  });

  // 2. If scrape was successful or retried with price found, update price history
  if (scrapeResult.price !== null) {
    await db.addPriceHistory({
      product_id: productId,
      price: scrapeResult.price,
      mrp: scrapeResult.mrp,
      stock: scrapeResult.stock,
      currency: scrapeResult.currency
    });

    await db.updateProductStatus(productId, {
      last_scraped_at: new Date().toISOString(),
      last_status: scrapeResult.status
    });

    // 3. Check for active alerts
    const alerts = await db.getAlerts(productId);
    for (const alert of alerts) {
      if (!alert.is_triggered) {
        if (alert.alert_type === 'PRICE_DROP' && scrapeResult.price <= alert.target_price) {
          await sendAlertNotification(alert, { name: `Product #${mockProductId}` }, scrapeResult.price, scrapeResult.stock);
        } else if (alert.alert_type === 'BACK_IN_STOCK' && scrapeResult.stock !== 'Out of Stock') {
          await sendAlertNotification(alert, { name: `Product #${mockProductId}` }, scrapeResult.price, scrapeResult.stock);
        }
      }
    }
  } else {
    await db.updateProductStatus(productId, {
      last_scraped_at: new Date().toISOString(),
      last_status: 'FAILED'
    });
  }

  return scrapeResult;
}

module.exports = {
  searchProducts,
  getTrackedProducts,
  trackProduct,
  untrackProduct,
  runSingleScrape
};
