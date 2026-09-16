const mongoose = require("mongoose");
const { mediaSchema, relatedContentSchema, seoSchema, publishingFields } = require("./shared/contentSchemas");

const portfolioProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },

    organizationName: { type: String, trim: true },
    organizationType: { type: String, trim: true }, // e.g. "College", "Club", "Company"
    sport: { type: String, trim: true }, // free string, admin UI restricts to shared constants
    productType: { type: String, trim: true }, // e.g. "Jersey Kit"
    quantity: { type: Number, min: 1 },

    description: { type: String },

    // Explicit card/listing image - admin-pasted Cloudinary URLs, same
    // pattern as Product.thumbnailImageUrl/thumbnailImageUrlMobile. Kept as
    // plain strings (not mediaSchema) since this is just a URL, not full
    // media metadata - and stays correct even if finalImages' order changes.
    thumbnailImageUrl: { type: String, trim: true },
    thumbnailImageUrlMobile: { type: String, trim: true },

    designImages: [mediaSchema],
    productionImages: [mediaSchema],
    finalImages: [mediaSchema],

    fabric: { type: String, trim: true },
    printingMethod: { type: String, trim: true },

    // Optional - only set when this project was actually built from a real
    // catalog design. Points at an existing Product + its embedded design
    // subdocument rather than duplicating a new Design collection.
    usedDesign: {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      designId: { type: mongoose.Schema.Types.ObjectId },
    },

    tags: [{ type: String, trim: true }],
    relatedContent: [relatedContentSchema],

    seo: seoSchema,
    ...publishingFields,
  },
  { timestamps: true }
);

portfolioProjectSchema.index({ sport: 1, productType: 1, tags: 1 }); // auto-related candidate queries
portfolioProjectSchema.index({ "relatedContent.refId": 1 }); // reverse-lookup queries from other content
portfolioProjectSchema.index({ status: 1, publishedAt: -1 }); // public listing queries

module.exports = mongoose.model("PortfolioProject", portfolioProjectSchema);
