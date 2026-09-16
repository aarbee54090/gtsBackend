const mongoose = require("mongoose");

// Stores the entire customizer "draft" (design, quantity, breakdowns,
// addons, price) as one Mixed blob rather than re-declaring its shape here -
// it mirrors the frontend's OrderDraft exactly (lib/order-draft.ts) and is
// only ever read/written as a whole, never queried by its internal fields.
// A customer can have several of these (product decision - not a single slot).
const savedOrderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    draft: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SavedOrder", savedOrderSchema);
