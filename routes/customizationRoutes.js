const express = require("express");
const { getCustomizations, createCustomization } = require("../controllers/customizationController");

const router = express.Router();

router.get("/", getCustomizations);
router.post("/", createCustomization);

module.exports = router;