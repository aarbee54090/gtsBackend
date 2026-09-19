const express = require("express");
const {
  createOrder,
  trackOrderByOrderId,
  getMyOrders,
  adminListOrders,
  adminGetReceiptImage,
  adminGetAdditionalFile,
  adminUpdateOrderStatus,
} = require("../controllers/orderController");
const requireAdmin = require("../middlewares/requireAdmin");
const requireCustomer = require("../middlewares/requireCustomer");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post(
  "/",
  requireCustomer, // orders now require an account - checked before the upload parses the multipart body
  upload.fields([
    { name: "receipt", maxCount: 1 },
    { name: "additionalFiles", maxCount: 10 },
  ]),
  createOrder
);
router.get("/mine", requireCustomer, getMyOrders);
router.get("/track/:orderId", trackOrderByOrderId); // public, no login - see controller
router.get("/admin/all", requireAdmin, adminListOrders);
router.get("/admin/:id/receipt", requireAdmin, adminGetReceiptImage);
router.get("/admin/:id/additional-file/:fileId", requireAdmin, adminGetAdditionalFile);
router.patch("/admin/:id/status", requireAdmin, adminUpdateOrderStatus);

module.exports = router;
