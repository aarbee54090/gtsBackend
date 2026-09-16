const mongoose = require("mongoose");

// One collection for every jersey customization option (fabric, quality
// tier, sleeve type, collar type), distinguished by `type`. Quantity is NOT
// stored here - this is just the reusable admin-managed price list. Order
// quantity is captured later when a customer actually places an order.
const jerseyCustomizationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["fabric", "quality", "sleeve", "collar"],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true }, // admin-set; cost at order time = price x quantity
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JerseyCustomization", jerseyCustomizationSchema);