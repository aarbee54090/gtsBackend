const mongoose = require("mongoose");
const { mediaSchema, seoSchema } = require("./shared/contentSchemas");

// Singleton document - there is only ever one About page. Enforced via a
// fixed key, same pattern as PaymentConfig.
const aboutPageSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    heading: { type: String, trim: true },
    body: { type: String }, // HTML from the admin's Tiptap rich-text editor
    heroImage: mediaSchema,
    seo: seoSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutPage", aboutPageSchema);

