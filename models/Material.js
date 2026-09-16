const mongoose = require("mongoose");
const { mediaSchema, relatedContentSchema, seoSchema, publishingFields } = require("./shared/contentSchemas");

// Kept lightweight on purpose - Materials is "supporting infrastructure" for
// Portfolio/Journal to link to, not a major standalone section. Promote to
// something bigger later only if it earns it.
const materialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },

    category: { type: String, trim: true }, // e.g. "Fabric"
    description: { type: String },

    gsm: { type: Number, min: 0 },
    features: [{ type: String, trim: true }], // e.g. "Lightweight", "Quick-drying"
    suitableFor: [{ type: String, trim: true }], // sports this material fits

    // Explicit card/listing image - admin-pasted Cloudinary URLs, same
    // pattern as Product.thumbnailImageUrl/thumbnailImageUrlMobile.
    thumbnailImageUrl: { type: String, trim: true },
    thumbnailImageUrlMobile: { type: String, trim: true },

    images: [mediaSchema],
    specifications: { type: mongoose.Schema.Types.Mixed }, // free-form key/value spec table

    tags: [{ type: String, trim: true }],
    relatedContent: [relatedContentSchema],

    seo: seoSchema,
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

materialSchema.index({ suitableFor: 1 });
materialSchema.index({ tags: 1 });
materialSchema.index({ "relatedContent.refId": 1 });
materialSchema.index({ status: 1 });

module.exports = mongoose.model("Material", materialSchema);
