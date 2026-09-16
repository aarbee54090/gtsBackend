const mongoose = require("mongoose");

// Polymorphic on purpose: "save" needs to work on catalog designs (which
// live embedded inside a Product, not their own collection - hence itemId
// is a plain String, not an ObjectId ref) as well as GTS Hub content
// (Portfolio/Journal/NewArrival/Material, which do have ObjectIds).
// name/imageUrl are a snapshot at save-time so a saved card still renders
// correctly even if the original design is later edited or removed by admin.
const savedDesignSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    itemType: {
      type: String,
      enum: ["catalog", "portfolio", "journal", "new-arrival", "material"],
      required: true,
    },
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    imageUrl: { type: String },

    // Only set for itemType "catalog" - lets a saved catalog design link
    // back to the exact customizer page it came from.
    categoryId: { type: String },
    sportSlug: { type: String },
    // GTS Hub content detail pages route by slug, not _id - stored so a
    // saved Portfolio/Journal/etc. card can link to the right page.
    slug: { type: String },
  },
  { timestamps: true }
);

// One save per (customer, item) - re-saving the same item is a no-op, not a duplicate row.
savedDesignSchema.index({ customerId: 1, itemType: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model("SavedDesign", savedDesignSchema);
