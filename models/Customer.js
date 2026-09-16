const mongoose = require("mongoose");

// No password/OTP field by design - phone number alone is the login
// identifier (product decision: zero-friction accounts for a small-business
// storefront). See requireCustomer + customerToken for the session mechanism.
const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    address: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
