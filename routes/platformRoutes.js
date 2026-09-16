const express = require("express");
const requireAdmin = require("../middlewares/requireAdmin");
const platformController = require("../controllers/platformController");

const router = express.Router();

// Public
router.get("/", platformController.listPublished);

// Admin
router.get("/admin", requireAdmin, platformController.adminList);
router.get("/admin/:id", requireAdmin, platformController.adminGetById);
router.post("/", requireAdmin, platformController.create);
router.put("/:id", requireAdmin, platformController.update);
router.delete("/:id", requireAdmin, platformController.remove);

module.exports = router;
