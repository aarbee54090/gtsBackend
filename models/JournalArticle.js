const mongoose = require("mongoose");
const { mediaSchema, relatedContentSchema, seoSchema, publishingFields } = require("./shared/contentSchemas");

const journalArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },

    excerpt: { type: String, trim: true, maxlength: 300 },
    content: { type: String }, // HTML from the admin's Tiptap rich-text editor

    coverImage: mediaSchema,

    category: { type: String, trim: true }, // e.g. "Guides", "Behind the Scenes"
    sport: { type: String, trim: true },
    productType: { type: String, trim: true },
    tags: [{ type: String, trim: true }],

    author: { type: String, trim: true, default: "GTS" },

    relatedContent: [relatedContentSchema],

    seo: seoSchema,
    ...publishingFields,
  },
  { timestamps: true }
);

journalArticleSchema.index({ sport: 1, productType: 1, tags: 1 });
journalArticleSchema.index({ "relatedContent.refId": 1 });
journalArticleSchema.index({ status: 1, publishedAt: -1 });

module.exports = mongoose.model("JournalArticle", journalArticleSchema);
