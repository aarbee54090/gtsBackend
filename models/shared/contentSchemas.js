const mongoose = require("mongoose");

// Embedded media entry, not a separate Media collection (deferred for V1 -
// promote later only if a real need for a shared media library shows up).
// Structured rather than a bare URL string so every image/video carries alt
// text (accessibility + SEO) and can be an image OR a video from day one.
const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true }, // Cloudinary/YouTube/Vimeo URL
    type: { type: String, enum: ["image", "video"], default: "image" },
    provider: { type: String, trim: true, default: "cloudinary" },
    alt: { type: String, trim: true },
    caption: { type: String, trim: true },
  },
  { _id: false }
);

// One-directional link to another piece of GTS Hub content. Stored on the
// document that created the link only - the reverse direction is never
// written, only computed at read time (see relatedContentService.js).
const relatedContentSchema = new mongoose.Schema(
  {
    contentType: {
      type: String,
      enum: ["portfolio", "journal", "new-arrival", "material"],
      required: true,
    },
    refId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { _id: false }
);

// title/description/ogImage only - no keywords array (modern search engines
// ignore meta keywords; og:image is what actually drives link-preview cards).
const seoSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    ogImage: { type: String, trim: true },
  },
  { _id: false }
);

// Spread (not nested) into each content schema - draft/published lifecycle.
// Field-level "required" stays minimal on the schema itself; completeness
// for publishing is enforced in the service layer, not here (see
// publishValidation.js) so saving a draft never fails on missing fields.
const publishingFields = {
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  publishedAt: { type: Date },
  featured: { type: Boolean, default: false },
};

module.exports = { mediaSchema, relatedContentSchema, seoSchema, publishingFields };
