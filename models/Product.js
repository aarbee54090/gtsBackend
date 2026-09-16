const mongoose = require("mongoose");

// Each design is embedded on the product and gets its own unique _id and
// imageUrl. Since sport now lives on the product itself (not per-design),
// every design here already belongs to the right sport.
const designSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true }, // Cloudinary URL
    price: { type: Number, default: 0 }, // admin-set price for this specific design
  },
  { _id: true }
);

// Quantity-based pricing tier - e.g. "1-2 pcs = ₹500", "3-5 pcs = ₹450".
// maxQty null means "and above" (the top/uncapped tier).
const pricingTierSchema = new mongoose.Schema(
  {
    minQty: { type: Number, required: true, min: 1 },
    maxQty: { type: Number, default: null },
    price: { type: Number, required: true },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Football Jersey Kit"
    category: { type: String, required: true, trim: true }, // e.g. "Jersey Kit"
    sport: { type: String, required: true, trim: true }, // e.g. "Football" - one sport per document
    // Main card image for the /customize/[category] sport-picker grid.
    // Optional (pasted Cloudinary URL, same pattern as design images) -
    // older products without one just fall back to icon+title only.
    thumbnailImageUrl: { type: String, trim: true },
    // Optional separate crop for the mobile sport-picker layout (a wide
    // horizontal card), since a square/portrait desktop thumbnail often
    // doesn't compose well in a wide card. Falls back to thumbnailImageUrl
    // on the frontend if this isn't set.
    thumbnailImageUrlMobile: { type: String, trim: true },
    designs: [designSchema],
    pricingTiers: [pricingTierSchema], // admin-set, per-product, quantity-based pricing
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);