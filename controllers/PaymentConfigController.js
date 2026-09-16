const PaymentConfig = require("../models/PaymentConfig");

// GET /api/payment-config
// Public - the checkout page needs this to render the payment method
// picker (eSewa / Khalti / Bank / etc.) with each one's QR code and details.
async function getPaymentConfig(req, res) {
  try {
    const config = await PaymentConfig.findOne({ key: "default" });
    if (!config) {
      return res.status(404).json({ success: false, message: "Payment config not set up yet" });
    }
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/payment-config
// Admin-protected. Upserts the singleton doc - the admin panel sends the
// full methods array each time.
async function updatePaymentConfig(req, res) {
  try {
    const { methods } = req.body;
    const config = await PaymentConfig.findOneAndUpdate(
      { key: "default" },
      { methods, key: "default" },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: config });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getPaymentConfig, updatePaymentConfig };