const express = require("express");
const { getPaymentConfig, updatePaymentConfig } = require("../controllers/PaymentConfigController");
const requireAdmin = require("../middlewares/requireAdmin");

const router = express.Router();

router.get("/", getPaymentConfig);
router.put("/", requireAdmin, updatePaymentConfig);

module.exports = router;