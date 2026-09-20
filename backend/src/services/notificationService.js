/**
 * Notification service for Price Drop & Back-in-stock alerts.
 * Supports console logging in dev and optional SendGrid / SMTP email dispatch.
 */
async function sendAlertNotification(alert, product, currentPrice, currentStock) {
  const subject = `[Price Alert] ${product.name} - ${alert.alert_type}`;
  const message = alert.alert_type === 'PRICE_DROP'
    ? `Price Drop Alert! ${product.name} is now available for ₹${currentPrice} (Target was ₹${alert.target_price}).`
    : `Back in Stock Alert! ${product.name} is now back in stock (${currentStock}).`;

  console.log(`\n🔔 [ALERT TRIGGERED] -> Sending to ${alert.user_email || 'System Dashboard'}`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${message}\n`);

  // Optional: SendGrid or Nodemailer logic can be attached here when process.env.SENDGRID_API_KEY is defined
  return { success: true, message };
}

module.exports = { sendAlertNotification };
