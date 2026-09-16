const mongoose = require("mongoose");
const { seoSchema } = require("./shared/contentSchemas");

// Singleton document - same pattern as PaymentConfig/AboutPage.
const contactInfoSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    address: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    mapEmbedUrl: { type: String, trim: true }, // Google Maps embed iframe src
    seo: seoSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactInfo", contactInfoSchema);
