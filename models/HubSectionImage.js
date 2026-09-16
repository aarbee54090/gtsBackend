const mongoose = require("mongoose");

// Fixed, known set of cards on the /gts-hub landing page - not admin-
// creatable, just admin-editable per key.
const SECTION_KEYS = ["portfolio", "new-arrivals", "materials", "journal", "about", "contact"];

const hubSectionImageSchema = new mongoose.Schema(
  {
    sectionKey: { type: String, enum: SECTION_KEYS, required: true, unique: true },
    desktopImageUrl: { type: String, trim: true },
    mobileImageUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

const HubSectionImage = mongoose.model("HubSectionImage", hubSectionImageSchema);
HubSectionImage.SECTION_KEYS = SECTION_KEYS;

module.exports = HubSectionImage;
