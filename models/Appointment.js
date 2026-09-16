const mongoose = require("mongoose");

// Guest booking - no customerId (per product decision, matches how Orders
// used to work before accounts). Validity of date/time against that date's
// Availability window is checked at creation time in the controller, not
// re-enforced here, since Availability can change independently afterward.
const appointmentSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true },
    time: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
