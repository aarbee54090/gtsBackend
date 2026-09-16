const SavedDesign = require("../models/SavedDesign");

// GET /api/saved-designs - requireCustomer
async function listMine(req, res) {
  try {
    const items = await SavedDesign.find({ customerId: req.customer._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/saved-designs - requireCustomer
// Upsert: saving something already-saved just refreshes it rather than erroring.
async function save(req, res) {
  try {
    const { itemType, itemId, name, imageUrl, categoryId, sportSlug, slug } = req.body;
    if (!itemType || !itemId || !name) {
      return res.status(400).json({ success: false, message: "itemType, itemId, and name are required" });
    }

    const item = await SavedDesign.findOneAndUpdate(
      { customerId: req.customer._id, itemType, itemId },
      { customerId: req.customer._id, itemType, itemId, name, imageUrl, categoryId, sportSlug, slug },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/saved-designs/:itemType/:itemId - requireCustomer
async function unsave(req, res) {
  try {
    const { itemType, itemId } = req.params;
    await SavedDesign.findOneAndDelete({ customerId: req.customer._id, itemType, itemId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { listMine, save, unsave };
