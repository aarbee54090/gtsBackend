const JerseyCustomization = require("../models/JerseyCustomization");

// GET /api/customizations
// GET /api/customizations?type=sleeve
async function getCustomizations(req, res) {
  try {
    const filter = { isActive: true };
    if (req.query.type) {
      filter.type = req.query.type;
    }
    const items = await JerseyCustomization.find(filter);
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/customizations
async function createCustomization(req, res) {
  try {
    const item = await JerseyCustomization.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getCustomizations, createCustomization };