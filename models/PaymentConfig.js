const mongoose = require("mongoose");

// One entry per payment option shown at checkout (eSewa, Khalti, Bank, etc.).
// qrCodeImageUrl is a Cloudinary URL pasted in by the admin, same pattern
// as Product design images - no upload pipeline needed.
const paymentMethodSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["esewa", "khalti", "bank", "other"],
    },
    label: { type: String, required: true, trim: true }, // e.g. "Nabil Bank", "eSewa"
    qrCodeImageUrl: { type: String, required: true },
    details: {
      accountName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      bankName: { type: String, trim: true },
      branch: { type: String, trim: true },
      ifsc: { type: String, trim: true },
      upiId: { type: String, trim: true },
    },
  },
  { _id: true }
);

// Singleton document - there is only ever one active payment configuration.
// Enforced via a fixed key rather than relying on a single hardcoded _id.
const paymentConfigSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    methods: [paymentMethodSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentConfig", paymentConfigSchema);