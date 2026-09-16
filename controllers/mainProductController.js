const MainProduct = require("../models/MainProduct");

// GET /api/main-products
// Public - active main product lines only, for the /products landing page.
async function getMainProducts(req, res) {
  try {
    const mainProducts = await MainProduct.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, count: mainProducts.length, data: mainProducts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/main-products/admin
// Admin - every main product line regardless of isActive, for the admin list.
async function adminListMainProducts(req, res) {
  try {
    const mainProducts = await MainProduct.find().sort({ name: 1 });
    res.json({ success: true, count: mainProducts.length, data: mainProducts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/main-products/:id
// Single main product by id - used by the admin edit page.
async function getMainProductById(req, res) {
  try {
    const mainProduct = await MainProduct.findById(req.params.id);
    if (!mainProduct) {
      return res.status(404).json({ success: false, message: "Main product not found" });
    }
    res.json({ success: true, data: mainProduct });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid main product id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/main-products
async function createMainProduct(req, res) {
  try {
    const mainProduct = await MainProduct.create(req.body);
    res.status(201).json({ success: true, data: mainProduct });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "A main product with this name already exists" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/main-products/:id
async function updateMainProduct(req, res) {
  try {
    const mainProduct = await MainProduct.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!mainProduct) {
      return res.status(404).json({ success: false, message: "Main product not found" });
    }
    res.json({ success: true, data: mainProduct });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid main product id" });
    }
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "A main product with this name already exists" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/main-products/:id
async function deleteMainProduct(req, res) {
  try {
    const mainProduct = await MainProduct.findByIdAndDelete(req.params.id);
    if (!mainProduct) {
      return res.status(404).json({ success: false, message: "Main product not found" });
    }
    res.json({ success: true, data: mainProduct });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid main product id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getMainProducts,
  adminListMainProducts,
  getMainProductById,
  createMainProduct,
  updateMainProduct,
  deleteMainProduct,
};
