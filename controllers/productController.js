const Product = require("../models/Product");

// GET /api/products/categories
// Distinct category strings actually in use across sub-products - kept for
// any internal/admin use that needs the raw list. The public landing page
// now uses /api/main-products instead, which has real admin-curated
// name/thumbnail/description per main product line.
async function getCategories(req, res) {
  try {
    const categories = await Product.distinct("category", { isActive: true });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/products
// Main page — every product-variant document (main page groups these by category).
async function getProducts(req, res) {
  try {
    const products = await Product.find({ isActive: true }).select(
      "name category sport designs"
    );
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/products/category/:category
// Sport picker page — every sport variant that exists for one category.
async function getProductsByCategory(req, res) {
  try {
    const { category } = req.params;
    const products = await Product.find({ category, isActive: true }).select(
      "name category sport thumbnailImageUrl thumbnailImageUrlMobile"
    );
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/products/category/:category/sport/:sport
// Design gallery page — the one matching product, with its full design list.
async function getProductByCategorySport(req, res) {
  try {
    const { category, sport } = req.params;
    const product = await Product.findOne({
      category,
      sport: new RegExp(`^${sport}$`, "i"), // case-insensitive exact match
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/products
// Creates one product-variant document (one sport, its own designs).
async function createProduct(req, res) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/products/:id
// Single product by its own id - used by the admin edit page.
async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/products/:id
async function updateProduct(req, res) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/products/:id
async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getProducts,
  getProductsByCategory,
  getProductByCategorySport,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};