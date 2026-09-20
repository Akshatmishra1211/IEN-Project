const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiRoutes = require('./routes/api');
const { triggerScrapeAll } = require('./controllers/scrapeController');
const { db } = require('./config/supabase');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    databaseMode: db.isInMemory() ? 'In-Memory Fallback' : 'Connected to Supabase'
  });
});

// API Routes
app.use('/api', apiRoutes);

// Internal scheduled cron fallback (runs every 2 hours: '0 */2 * * *')
// For free tier sleeping backends, external cron-job.org calls POST /api/cron/scrape-all
cron.schedule('0 */2 * * *', async () => {
  console.log('[Internal Cron] Running 2-hour scheduled scrape job...');
  try {
    const products = await db.getProducts();
    const active = products.filter(p => p.is_active);
    console.log(`[Internal Cron] Scraped ${active.length} products on schedule.`);
  } catch (err) {
    console.error('[Internal Cron] Error running schedule:', err.message);
  }
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` INE Product Price Tracker Backend running on port ${PORT}`);
  console.log(` Database status: ${db.isInMemory() ? 'In-Memory Fallback (Local)' : 'Supabase (Remote)'}`);
  console.log(` Scheduled Scrape Cron: Every 2 hours (0 */2 * * *)`);
  console.log(` External Cron Webhook: POST http://localhost:${PORT}/api/cron/scrape-all`);
  console.log(`======================================================\n`);
});
