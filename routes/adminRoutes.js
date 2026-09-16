const express = require("express");
const requireAdmin = require("../middlewares/requireAdmin");

const router = express.Router();

// GET /api/admin/verify
// If requireAdmin lets the request through, the key is valid.
// No side effects - just confirms whether the key is correct.
router.get("/verify", requireAdmin, (req, res) => {
  res.json({ success: true, message: "Key is valid" });
});

module.exports = router;