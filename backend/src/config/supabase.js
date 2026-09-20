const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;
let isInMemoryFallback = false;

// In-memory fallback database for local execution without live Supabase credentials
const memoryDb = {
  products: [],
  price_history: [],
  scrape_logs: [],
  alerts: []
};

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Supabase] Initialized with remote URL:', supabaseUrl);
  } catch (err) {
    console.warn('[Supabase] Initialization failed, using in-memory store:', err.message);
    isInMemoryFallback = true;
  }
} else {
  console.log('[Supabase] Credentials missing or empty. Operating in local memory fallback mode.');
  isInMemoryFallback = true;
}

// Wrapper database client interface supporting both Supabase and memory fallback
const db = {
  isInMemory: () => isInMemoryFallback,

  async getProducts() {
    if (supabase && !isInMemoryFallback) {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error) return data;
      console.warn('[Supabase] Error fetching products:', error.message);
    }
    return memoryDb.products;
  },

  async addProduct(product) {
    const newProduct = {
      id: product.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      mock_product_id: product.mock_product_id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      sku: product.sku,
      description: product.description,
      scrape_interval_hours: product.scrape_interval_hours || 2,
      is_active: true,
      last_scraped_at: null,
      last_status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (supabase && !isInMemoryFallback) {
      const { data, error } = await supabase.from('products').insert([newProduct]).select().single();
      if (!error && data) return data;
      console.warn('[Supabase] Error adding product, falling back to memory:', error?.message);
    }

    // Memory fallback logic
    const existing = memoryDb.products.find(p => p.mock_product_id === product.mock_product_id);
    if (existing) return existing;
    memoryDb.products.unshift(newProduct);
    return newProduct;
  },

  async updateProductStatus(id, updateData) {
    const fields = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    if (supabase && !isInMemoryFallback) {
      const { data, error } = await supabase.from('products').update(fields).eq('id', id).select().single();
      if (!error) return data;
    }

    const item = memoryDb.products.find(p => p.id === id);
    if (item) {
      Object.assign(item, fields);
      return item;
    }
    return null;
  },

  async removeProduct(id) {
    if (supabase && !isInMemoryFallback) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) return true;
    }
    const index = memoryDb.products.findIndex(p => p.id === id);
    if (index !== -1) {
      memoryDb.products.splice(index, 1);
      memoryDb.price_history = memoryDb.price_history.filter(ph => ph.product_id !== id);
      memoryDb.scrape_logs = memoryDb.scrape_logs.filter(sl => sl.product_id !== id);
      return true;
    }
    return false;
  },

  async addPriceHistory(entry) {
    const record = {
      id: `ph_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      product_id: entry.product_id,
      price: parseFloat(entry.price),
      mrp: entry.mrp ? parseFloat(entry.mrp) : null,
      stock: entry.stock || 'In Stock',
      currency: entry.currency || 'INR',
      scraped_at: new Date().toISOString()
    };

    if (supabase && !isInMemoryFallback) {
      const { data, error } = await supabase.from('price_history').insert([record]).select().single();
      if (!error) return data;
    }
    memoryDb.price_history.unshift(record);
    return record;
  },

  async getPriceHistory(productId) {
    if (supabase && !isInMemoryFallback) {
      const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .eq('product_id', productId)
        .order('scraped_at', { ascending: true });
      if (!error) return data;
    }
    return memoryDb.price_history
      .filter(ph => ph.product_id === productId)
      .sort((a, b) => new Date(a.scraped_at) - new Date(b.scraped_at));
  },

  async addScrapeLog(log) {
    const record = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      product_id: log.product_id,
      status: log.status, // 'SUCCESS', 'RETRIED', 'FAILED'
      attempts: log.attempts || 1,
      duration_ms: log.duration_ms || 0,
      price_found: log.price_found ? parseFloat(log.price_found) : null,
      stock_found: log.stock_found || null,
      error_message: log.error_message || null,
      structure_changed: !!log.structure_changed,
      scraped_at: new Date().toISOString()
    };

    if (supabase && !isInMemoryFallback) {
      const { data, error } = await supabase.from('scrape_logs').insert([record]).select().single();
      if (!error) return data;
    }
    memoryDb.scrape_logs.unshift(record);
    return record;
  },

  async getScrapeLogs(productId) {
    if (supabase && !isInMemoryFallback) {
      const { data, error } = await supabase
        .from('scrape_logs')
        .select('*')
        .eq('product_id', productId)
        .order('scraped_at', { ascending: false });
      if (!error) return data;
    }
    return memoryDb.scrape_logs
      .filter(sl => sl.product_id === productId)
      .sort((a, b) => new Date(b.scraped_at) - new Date(a.scraped_at));
  },

  async createAlert(alertData) {
    const record = {
      id: `alt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      product_id: alertData.product_id,
      target_price: parseFloat(alertData.target_price),
      alert_type: alertData.alert_type || 'PRICE_DROP',
      user_email: alertData.user_email || '',
      is_triggered: false,
      created_at: new Date().toISOString()
    };

    if (supabase && !isInMemoryFallback) {
      const { data, error } = await supabase.from('alerts').insert([record]).select().single();
      if (!error) return data;
    }
    memoryDb.alerts.unshift(record);
    return record;
  },

  async getAlerts(productId) {
    if (supabase && !isInMemoryFallback) {
      const { data, error } = await supabase.from('alerts').select('*').eq('product_id', productId);
      if (!error) return data;
    }
    return memoryDb.alerts.filter(a => a.product_id === productId);
  }
};

module.exports = { supabase, db };
