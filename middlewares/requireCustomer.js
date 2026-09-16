const Customer = require("../models/Customer");
const { verifyCustomerToken } = require("../services/customerToken");

const COOKIE_NAME = "gts_customer_token";

// No cookie-parser dependency - parsed directly off the raw Cookie header.
function readCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const pair of header.split(";")) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    if (key === name) return decodeURIComponent(pair.slice(idx + 1).trim());
  }
  return null;
}

async function requireCustomer(req, res, next) {
  try {
    const token = readCookie(req, COOKIE_NAME);
    const customerId = token ? verifyCustomerToken(token) : null;

    if (!customerId) {
      return res.status(401).json({ success: false, message: "Please log in to continue" });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(401).json({ success: false, message: "Please log in to continue" });
    }

    req.customer = customer;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = requireCustomer;
module.exports.COOKIE_NAME = COOKIE_NAME;
