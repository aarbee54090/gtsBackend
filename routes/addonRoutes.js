const express = require("express");
const requireAdmin = require("../middlewares/requireAdmin");
const { getAddons, adminList, adminGetById, createAddon, update, remove } = require("../controllers/addonController");

const router = express.Router();

// Public
router.get("/", getAddons);

// Admin
router.get("/admin", requireAdmin, adminList);
router.get("/admin/:id", requireAdmin, adminGetById);
router.post("/", requireAdmin, createAddon);
router.put("/:id", requireAdmin, update);
router.delete("/:id", requireAdmin, remove);

module.exports = router;