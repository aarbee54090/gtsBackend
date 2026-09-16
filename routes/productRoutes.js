const express = require("express");
const {
  getProducts,
  getProductsByCategory,
  getProductByCategorySport,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const requireAdmin = require("../middlewares/requireAdmin");

const router = express.Router();

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/category/:category", getProductsByCategory);
router.get("/category/:category/sport/:sport", getProductByCategorySport);
router.get("/:id", getProductById);
router.post("/", requireAdmin, createProduct);
router.put("/:id", requireAdmin, updateProduct);
router.delete("/:id", requireAdmin, deleteProduct);

module.exports = router;