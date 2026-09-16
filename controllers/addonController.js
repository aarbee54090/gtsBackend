const Addon = require("../models/Addon");

// GET /api/addons - public, active only.
async function getAddons(req, res) {
  try {
    const items = await Addon.find({ isActive: true });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/addons/admin - admin-protected, every addon (active + inactive), for the admin list table.
async function adminList(req, res) {
  try {
    const items = await Addon.find({}).sort({ name: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/addons/admin/:id - admin-protected, for the edit form.
async function adminGetById(req, res) {
  try {
    const item = await Addon.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Addon not found" });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid addon id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/addons - admin-protected create.
async function createAddon(req, res) {
  try {
    const item = await Addon.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/addons/:id - admin-protected update.
async function update(req, res) {
  try {
    const item = await Addon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: "Addon not found" });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid addon id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/addons/:id - admin-protected delete.
async function remove(req, res) {
  try {
    const item = await Addon.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Addon not found" });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid addon id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAddons, adminList, adminGetById, createAddon, update, remove };