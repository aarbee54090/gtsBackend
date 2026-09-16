const SavedOrder = require("../models/SavedOrder");

// GET /api/saved-orders - requireCustomer
async function listMine(req, res) {
  try {
    const items = await SavedOrder.find({ customerId: req.customer._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/saved-orders - requireCustomer
async function save(req, res) {
  try {
    const { draft } = req.body;
    if (!draft) {
      return res.status(400).json({ success: false, message: "draft is required" });
    }
    const item = await SavedOrder.create({ customerId: req.customer._id, draft });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/saved-orders/:id - requireCustomer
async function remove(req, res) {
  try {
    const item = await SavedOrder.findOneAndDelete({ _id: req.params.id, customerId: req.customer._id });
    if (!item) {
      return res.status(404).json({ success: false, message: "Saved order not found" });
    }
    res.json({ success: true });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid saved order id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { listMine, save, remove };
