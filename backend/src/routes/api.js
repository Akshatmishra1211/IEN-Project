const express = require('express');
const router = express.Router();

const {
  searchProducts,
  getTrackedProducts,
  trackProduct,
  untrackProduct
} = require('../controllers/productController');

const {
  triggerScrapeProduct,
  triggerScrapeAll,
  getPriceHistory,
  getScrapeLogs
} = require('../controllers/scrapeController');

const {
  createAlert,
  getAlerts
} = require('../controllers/alertController');

// Catalog Search Route
router.get('/catalog', searchProducts);

// Tracked Products Management
router.get('/products', getTrackedProducts);
router.post('/products', trackProduct);
router.delete('/products/:id', untrackProduct);

// Scrape Operations
router.post('/products/:id/scrape', triggerScrapeProduct);
router.get('/products/:id/history', getPriceHistory);
router.get('/products/:id/logs', getScrapeLogs);

// Cron Endpoint (External Triggers)
router.all('/cron/scrape-all', triggerScrapeAll);

// Alerts
router.post('/alerts', createAlert);
router.get('/products/:id/alerts', getAlerts);

module.exports = router;
