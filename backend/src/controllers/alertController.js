const { db } = require('../config/supabase');

async function createAlert(req, res) {
  try {
    const { product_id, target_price, alert_type, user_email } = req.body;

    if (!product_id || target_price === undefined) {
      return res.status(400).json({ success: false, error: 'product_id and target_price are required' });
    }

    const alert = await db.createAlert({
      product_id,
      target_price: parseFloat(target_price),
      alert_type: alert_type || 'PRICE_DROP',
      user_email: user_email || ''
    });

    res.status(201).json({
      success: true,
      message: 'Alert configured successfully',
      alert
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getAlerts(req, res) {
  try {
    const { id } = req.params;
    const alerts = await db.getAlerts(id);
    res.json({
      success: true,
      alerts
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  createAlert,
  getAlerts
};
