const Platform = require("../models/Platform");
const slugify = require("../services/slugify");

// Not built on contentControllerFactory: that factory's public list sorts by
// featured+publishedAt and wires in getRelatedContent/assertReadyToPublish,
// none of which apply here. Platforms sort by an admin-set `order` field
// instead, so this stays a small dedicated controller.

// GET / - public, published only, sorted by admin-set order.
async function listPublished(req, res) {
  try {
    const items = await Platform.find({ status: "published" }).sort({ order: 1, name: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /admin - admin-protected, every status, for the admin list table.
async function adminList(req, res) {
  try {
    const items = await Platform.find({}).sort({ order: 1, name: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /admin/:id - admin-protected, any status, for the edit form.
async function adminGetById(req, res) {
  try {
    const item = await Platform.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Platform not found" });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid platform id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST / - admin-protected create.
async function create(req, res) {
  try {
    const body = { ...req.body };
    if (!body.slug && body.name) body.slug = slugify(body.name);
    if (body.status === "published" && !body.publishedAt) body.publishedAt = new Date();

    const item = await Platform.create(body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Slug already in use" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /:id - admin-protected update.
async function update(req, res) {
  try {
    const existing = await Platform.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Platform not found" });
    }

    const body = { ...req.body };
    if (body.status === "published" && !existing.publishedAt && !body.publishedAt) {
      body.publishedAt = new Date();
    }

    const item = await Platform.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: item });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid platform id" });
    }
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Slug already in use" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /:id - admin-protected delete.
async function remove(req, res) {
  try {
    const item = await Platform.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Platform not found" });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid platform id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { listPublished, adminList, adminGetById, create, update, remove };
