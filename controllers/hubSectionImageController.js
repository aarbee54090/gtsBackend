const HubSectionImage = require("../models/HubSectionImage");

// GET /api/hub-section-images
// Public - feeds the background image behind each card on the /gts-hub
// landing page.
async function listSectionImages(req, res) {
  try {
    const items = await HubSectionImage.find({});
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/hub-section-images/:sectionKey
// Admin only. Upserts one section's image URLs.
async function adminUpsertSectionImage(req, res) {
  try {
    const { sectionKey } = req.params;
    if (!HubSectionImage.SECTION_KEYS.includes(sectionKey)) {
      return res.status(400).json({ success: false, message: "Unknown section key" });
    }
    const { desktopImageUrl, mobileImageUrl } = req.body;
    const item = await HubSectionImage.findOneAndUpdate(
      { sectionKey },
      { sectionKey, desktopImageUrl, mobileImageUrl },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: item });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/hub-section-images/:sectionKey
// Admin only. Clears a section's images back to none.
async function adminDeleteSectionImage(req, res) {
  try {
    const { sectionKey } = req.params;
    const item = await HubSectionImage.findOneAndDelete({ sectionKey });
    if (!item) {
      return res.status(404).json({ success: false, message: "No image set for this section" });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { listSectionImages, adminUpsertSectionImage, adminDeleteSectionImage };
