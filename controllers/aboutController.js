const AboutPage = require("../models/AboutPage");

// GET /api/about
// Public. 404 if the admin hasn't set it up yet - same pattern as
// PaymentConfig - the public page renders a friendly fallback for that case.
async function getAboutPage(req, res) {
  try {
    const page = await AboutPage.findOne({ key: "default" });
    if (!page) {
      return res.status(404).json({ success: false, message: "About page not set up yet" });
    }
    res.json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/about
// Admin-protected. Upserts the singleton doc.
async function updateAboutPage(req, res) {
  try {
    const { heading, body, heroImage, seo } = req.body;
    const page = await AboutPage.findOneAndUpdate(
      { key: "default" },
      { key: "default", heading, body, heroImage, seo },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: page });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAboutPage, updateAboutPage };
