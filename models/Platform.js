const mongoose = require("mongoose");
const { mediaSchema } = require("./shared/contentSchemas");

// GTS Hub "Our Platforms" section. Deliberately lean - unlike
// Portfolio/Journal/NewArrival/Material this doesn't need tags,
// relatedContent, or seo: platform cards link straight out to an external
// profile URL, they're never linked to from another piece of content, and
// they have no on-site detail page to optimize for search.
const platformSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Instagram"
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },

    url: { type: String, required: true, trim: true }, // external profile link
    description: { type: String, trim: true }, // one-line card description

    logo: mediaSchema, // single image - admin pastes a Cloudinary URL, same as Journal's coverImage

    order: { type: Number, default: 0 }, // manual sort position on the Hub page (ascending)

    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

platformSchema.index({ status: 1 });
platformSchema.index({ order: 1 });

module.exports = mongoose.model("Platform", platformSchema);
