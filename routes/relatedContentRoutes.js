const express = require("express");
const { suggest } = require("../controllers/relatedContentController");
const requireAdmin = require("../middlewares/requireAdmin");

const router = express.Router();

router.post("/suggest", requireAdmin, suggest);

module.exports = router;
