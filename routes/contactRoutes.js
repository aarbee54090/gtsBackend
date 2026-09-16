const express = require("express");
const {
  getContactInfo,
  updateContactInfo,
  createSubmission,
  adminListSubmissions,
  adminUpdateSubmissionStatus,
  adminDeleteSubmission,
} = require("../controllers/contactController");
const requireAdmin = require("../middlewares/requireAdmin");

const router = express.Router();

router.get("/", getContactInfo);
router.put("/", requireAdmin, updateContactInfo);
router.post("/submissions", createSubmission);
router.get("/submissions", requireAdmin, adminListSubmissions);
router.patch("/submissions/:id/status", requireAdmin, adminUpdateSubmissionStatus);
router.delete("/submissions/:id", requireAdmin, adminDeleteSubmission);

module.exports = router;
