const mongoose = require("mongoose");

// Each style within an addon now has its own price, plus an image and
// description for the customer-facing preview (e.g. Shorts: Normal ₹220,
// Number Print ₹265, Number+Logo ₹320, Stripe+Logo+Number ₹400, Full Design ₹700).
const styleSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // e.g. "Number Print"
    price: { type: Number, required: true },
    imageUrl: { type: String }, // Cloudinary URL, for the preview
    description: { type: String, trim: true }, // for the preview
  },
  { _id: true }
);

const addonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Shorts", "Track"
    styles: [styleSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Addon", addonSchema);