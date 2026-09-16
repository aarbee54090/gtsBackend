const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // Non-sequential, hard-to-guess public identifier - the ONLY key used
    // for customer-facing lookup (no login, no second factor).
    orderId: { type: String, required: true, unique: true, index: true },

    // Orders now require a logged-in account to create (product decision) -
    // this is how "My Orders" finds a customer's own order history.
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },

    productName: { type: String, required: true },
    category: { type: String, required: true },
    sport: { type: String, required: true },
    designName: { type: String, required: true },
    designImageUrl: { type: String },

    quantity: { type: Number, required: true, min: 1 },
    sleeveBreakdown: [{ label: String, quantity: Number }],
    collarBreakdown: [{ label: String, quantity: Number }],
    addonLines: [{ addonName: String, styleLabel: String, quantity: Number, price: Number }],

    // Snapshot of the price breakdown at order time - never recomputed later.
    priceBreakdown: { type: mongoose.Schema.Types.Mixed, required: true },

    contact: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true },
    },
    address: { type: String, required: true, trim: true },

    // Which payment method the customer paid through (matches a "type" in
    // PaymentConfig.methods at the time of order, e.g. "esewa", "bank").
    paymentMethod: { type: String, required: true, trim: true },

    deadlineDate: { type: Date },
    couponCode: { type: String, trim: true },

    // Payment proof - stored inline as image data (per spec: each order only
    // ever has one, so an external file host isn't worth the complexity).
    // The QR code shown to customers is separate (PaymentConfig, a
    // Cloudinary URL) - only this customer-submitted receipt is inline.
    receiptImage: {
      data: { type: Buffer, required: true },
      contentType: { type: String, required: true },
    },

    advanceAmount: { type: Number, required: true },
    balanceAmount: { type: Number, required: true },

    // Optional extra info, purely additive - doesn't affect pricing/quantity.
    players: [
      {
        name: String,
        number: String,
        size: String,
        sleeveType: String,
        neckType: String,
        shortsTrack: String,
        note: String,
      },
    ],
    additionalFiles: [
      {
        filename: { type: String, required: true },
        data: { type: Buffer, required: true },
        contentType: { type: String, required: true },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);