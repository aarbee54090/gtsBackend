const express = require("express");
const {
  getMainProducts,
  adminListMainProducts,
  getMainProductById,
  createMainProduct,
  updateMainProduct,
  deleteMainProduct,
} = require("../controllers/mainProductController");
const requireAdmin = require("../middlewares/requireAdmin");

const router = express.Router();

// Public
router.get("/", getMainProducts);

// Admin
router.get("/admin", requireAdmin, adminListMainProducts);
router.get("/:id", requireAdmin, getMainProductById);
router.post("/", requireAdmin, createMainProduct);
router.put("/:id", requireAdmin, updateMainProduct);
router.delete("/:id", requireAdmin, deleteMainProduct);

module.exports = router;
