const express = require("express");
const {
  listSectionImages,
  adminUpsertSectionImage,
  adminDeleteSectionImage,
} = require("../controllers/hubSectionImageController");
const requireAdmin = require("../middlewares/requireAdmin");

const router = express.Router();

router.get("/", listSectionImages);
router.put("/:sectionKey", requireAdmin, adminUpsertSectionImage);
router.delete("/:sectionKey", requireAdmin, adminDeleteSectionImage);

module.exports = router;
