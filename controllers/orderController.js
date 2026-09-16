const Order = require("../models/Order");
const { generateOrderId } = require("../services/orderIdService");

// Multipart fields arrive as strings - these carry JSON-encoded objects/arrays.
function parseJsonField(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// POST /api/orders
// Requires a logged-in customer (requireCustomer, mounted in the route) -
// orders can no longer be placed as a guest, per product decision.
// multipart/form-data: plain fields for order details, a "receipt" file
// (required), and optional "additionalFiles" (logos, sponsor images, etc.)
// - all stored inline in MongoDB.
async function createOrder(req, res) {
  try {
    const {
      productName,
      category,
      sport,
      designName,
      designImageUrl,
      quantity,
      deadlineDate,
      couponCode,
      address,
      paymentMethod,
    } = req.body;

    const contact = parseJsonField(req.body.contact, {});
    const priceBreakdown = parseJsonField(req.body.priceBreakdown, {});
    const sleeveBreakdown = parseJsonField(req.body.sleeveBreakdown, []);
    const collarBreakdown = parseJsonField(req.body.collarBreakdown, []);
    const addonLines = parseJsonField(req.body.addonLines, []);
    const players = parseJsonField(req.body.players, []);

    if (!contact?.name || !contact?.phone) {
      return res.status(400).json({ success: false, message: "Contact name and phone are required" });
    }
    if (!address) {
      return res.status(400).json({ success: false, message: "Address is required" });
    }
    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: "Payment method is required" });
    }

    const receiptFile = req.files?.receipt?.[0];
    if (!receiptFile) {
      return res.status(400).json({ success: false, message: "Payment receipt image is required" });
    }

    const additionalFiles = (req.files?.additionalFiles ?? []).map((f) => ({
      filename: f.originalname,
      data: f.buffer,
      contentType: f.mimetype,
    }));

    const total = priceBreakdown?.total ?? 0;
    const advanceAmount = Math.round(total * 0.4);
    const balanceAmount = total - advanceAmount;

    const orderId = await generateOrderId();

    const order = await Order.create({
      orderId,
      customerId: req.customer._id,
      productName,
      category,
      sport,
      designName,
      designImageUrl,
      quantity: Number(quantity),
      sleeveBreakdown,
      collarBreakdown,
      addonLines,
      players,
      priceBreakdown,
      contact,
      address,
      paymentMethod,
      deadlineDate: deadlineDate || undefined,
      couponCode,
      receiptImage: { data: receiptFile.buffer, contentType: receiptFile.mimetype },
      additionalFiles,
      advanceAmount,
      balanceAmount,
    });

    res.status(201).json({ success: true, data: { orderId: order.orderId } });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/orders/mine - requireCustomer
// Replaces the old guest phone-based Track Order flow: order history is now
// tied to the logged-in account instead of a bare orderId/phone lookup.
async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ customerId: req.customer._id })
      .select("-receiptImage.data -additionalFiles.data")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/orders/:orderId
// Public lookup by order ID - the only key, no login (per spec). Excludes
// the receipt image bytes - too large for a plain JSON response, and not
// needed for the customer's own tracking view.
async function getOrderByOrderId(req, res) {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).select(
      "-receiptImage.data -additionalFiles.data"
    );
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/admin/orders
async function adminListOrders(req, res) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const orders = await Order.find(filter)
      .select("-receiptImage.data -additionalFiles.data")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/orders/admin/:id/receipt
// Admin-protected. Streams the raw receipt image bytes back with the
// correct Content-Type, so it can be viewed directly (e.g. <img src=...>
// or opened in a new tab) without ever exposing it in a JSON payload.
async function adminGetReceiptImage(req, res) {
  try {
    const order = await Order.findById(req.params.id).select("receiptImage");
    if (!order || !order.receiptImage?.data) {
      return res.status(404).json({ success: false, message: "Receipt not found" });
    }
    res.set("Content-Type", order.receiptImage.contentType);
    res.send(order.receiptImage.data);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid order id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/orders/admin/:id/additional-file/:fileId
// Admin-protected. Streams one additional file's bytes (a logo, sponsor
// image, etc.) back with the correct Content-Type.
async function adminGetAdditionalFile(req, res) {
  try {
    const order = await Order.findById(req.params.id).select("additionalFiles");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    const file = order.additionalFiles.id(req.params.fileId);
    if (!file || !file.data) {
      return res.status(404).json({ success: false, message: "File not found" });
    }
    res.set("Content-Type", file.contentType);
    res.set("Content-Disposition", `inline; filename="${file.filename}"`);
    res.send(file.data);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// PATCH /api/admin/orders/:id/status
async function adminUpdateOrderStatus(req, res) {
  try {
    const { status, adminNotes } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true, runValidators: true }
    ).select("-receiptImage.data -additionalFiles.data");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid order id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  createOrder,
  getOrderByOrderId,
  getMyOrders,
  adminListOrders,
  adminGetReceiptImage,
  adminGetAdditionalFile,
  adminUpdateOrderStatus,
};