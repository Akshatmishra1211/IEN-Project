import axios from 'axios';

const API_BASE = '/api';

export const api = {
  // Search catalog products from INE mock store
  searchCatalog: async (query = '', category = '') => {
    const res = await axios.get(`${API_BASE}/catalog`, { params: { query, category } });
    return res.data;
  },

  // Get all tracked products
  getTrackedProducts: async () => {
    const res = await axios.get(`${API_BASE}/products`);
    return res.data;
  },

  // Add product to tracking list
  trackProduct: async (productData) => {
    const res = await axios.post(`${API_BASE}/products`, productData);
    return res.data;
  },

  // Untrack product
  untrackProduct: async (id) => {
    const res = await axios.delete(`${API_BASE}/products/${id}`);
    return res.data;
  },

  // Manual trigger scrape (supports headed=true)
  triggerScrapeProduct: async (id, headed = false) => {
    const res = await axios.post(`${API_BASE}/products/${id}/scrape`, null, {
      params: { headed: headed ? 'true' : 'false' }
    });
    return res.data;
  },

  // Get price history for chart
  getPriceHistory: async (id) => {
    const res = await axios.get(`${API_BASE}/products/${id}/history`);
    return res.data;
  },

  // Get scrape audit logs
  getScrapeLogs: async (id) => {
    const res = await axios.get(`${API_BASE}/products/${id}/logs`);
    return res.data;
  },

  // Create price alert
  createAlert: async (alertData) => {
    const res = await axios.post(`${API_BASE}/alerts`, alertData);
    return res.data;
  },

  // Get product alerts
  getAlerts: async (id) => {
    const res = await axios.get(`${API_BASE}/products/${id}/alerts`);
    return res.data;
  }
};
