const mongoose = require("mongoose");

// Top-level product line (e.g. "Jersey", "Hoodie", "Tracksuit", "Polo T-Shirt")
// - fully separate from the existing Product model, which represents
// per-sport sub-products (e.g. "Basketball Jersey"). The link between the
// two levels is a plain string match: a Product's `category` field should
// equal a MainProduct's `name` exactly (admin-typed on both sides, no
// foreign key) - this keeps the existing sport-picker flow untouched.
const mainProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true }, // e.g. "Jersey" - must match Product.category exactly
    thumbnailImageUrl: { type: String, trim: true },
    // Optional separate crop for mobile - the /products landing page card
    // uses this on small screens if set, falling back to thumbnailImageUrl.
    thumbnailImageUrlMobile: { type: String, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

mainProductSchema.index({ isActive: 1 });

module.exports = mongoose.model("MainProduct", mainProductSchema);