const express = require("express");
const { getAboutPage, updateAboutPage } = require("../controllers/aboutController");
const requireAdmin = require("../middlewares/requireAdmin");

const router = express.Router();

router.get("/", getAboutPage);
router.put("/", requireAdmin, updateAboutPage);

module.exports = router;
