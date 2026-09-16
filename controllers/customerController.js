const Customer = require("../models/Customer");
const { issueCustomerToken } = require("../services/customerToken");
const { COOKIE_NAME } = require("../middlewares/requireCustomer");

const isProd = process.env.NODE_ENV === "production";
// sameSite "none" is required once frontend/backend are on different
// domains (Vercel/Render) - that requires secure:true too, which only
// works over HTTPS, so this deliberately relaxes to "lax"/insecure for
// local dev where both sides are plain http://localhost.
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 90 * 24 * 60 * 60 * 1000,
};

function publicCustomer(customer) {
  return {
    _id: customer._id,
    name: customer.name,
    phone: customer.phone,
    address: customer.address,
    createdAt: customer.createdAt,
  };
}

// POST /api/customers/register
// Creates the account and logs the customer in immediately.
async function register(req, res) {
  try {
    const { name, phone, address } = req.body;
    if (!name?.trim() || !phone?.trim() || !address?.trim()) {
      return res.status(400).json({ success: false, message: "Name, phone, and address are required" });
    }

    const existing = await Customer.findOne({ phone: phone.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this phone number already exists. Try logging in instead.",
      });
    }

    const customer = await Customer.create({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });

    res.cookie(COOKIE_NAME, issueCustomerToken(customer._id.toString()), COOKIE_OPTIONS);
    res.status(201).json({ success: true, data: publicCustomer(customer) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "An account with this phone number already exists." });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/customers/login
// Phone number only - no password, no OTP. Looks up the existing account
// and issues a session cookie if found.
async function login(req, res) {
  try {
    const { phone } = req.body;
    if (!phone?.trim()) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    const customer = await Customer.findOne({ phone: phone.trim() });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "No account found with this phone number. Please create an account.",
      });
    }

    res.cookie(COOKIE_NAME, issueCustomerToken(customer._id.toString()), COOKIE_OPTIONS);
    res.json({ success: true, data: publicCustomer(customer) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/customers/logout
function logout(req, res) {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax" });
  res.json({ success: true });
}

// GET /api/customers/me - requireCustomer
function me(req, res) {
  res.json({ success: true, data: publicCustomer(req.customer) });
}

// PUT /api/customers/me - requireCustomer
async function updateProfile(req, res) {
  try {
    const { name, address } = req.body;
    const update = {};
    if (name?.trim()) update.name = name.trim();
    if (address?.trim()) update.address = address.trim();

    const customer = await Customer.findByIdAndUpdate(req.customer._id, update, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: publicCustomer(customer) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { register, login, logout, me, updateProfile };
