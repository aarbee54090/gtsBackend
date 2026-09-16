const mongoose = require("mongoose");
const { mediaSchema, relatedContentSchema, seoSchema, publishingFields } = require("./shared/contentSchemas");

// Deliberately standalone - not tied to Product.designs[]. NewArrival is a
// fast-moving showcase (designs that may never become a formal catalog
// product, or change faster than the catalog does), so it gets its own
// images[] rather than forcing every showcase design into a catalog edit.
const newArrivalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },

    productType: { type: String, trim: true },
    sport: { type: String, trim: true },

    description: { type: String },

    // Explicit card/listing image - admin-pasted Cloudinary URLs, same
    // pattern as Product.thumbnailImageUrl/thumbnailImageUrlMobile.
    thumbnailImageUrl: { type: String, trim: true },
    thumbnailImageUrlMobile: { type: String, trim: true },

    images: [mediaSchema],

    availableCustomization: [{ type: String, trim: true }], // e.g. "Sleeve length", "Collar"
    tags: [{ type: String, trim: true }],

    relatedContent: [relatedContentSchema],

    seo: seoSchema,
    ...publishingFields,
  },
  { timestamps: true }
);

newArrivalSchema.index({ sport: 1, productType: 1, tags: 1 });
newArrivalSchema.index({ "relatedContent.refId": 1 });
newArrivalSchema.index({ status: 1, publishedAt: -1 });

module.exports = mongoose.model("NewArrival", newArrivalSchema);
