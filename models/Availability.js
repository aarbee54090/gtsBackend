const mongoose = require("mongoose");

// One doc per calendar date. Time-of-day is stored as "HH:mm" strings, not
// Date objects, since it's always interpreted in the business's own local
// time and never needs cross-timezone comparison.
const availabilitySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, unique: true, index: true },
    status: { type: String, enum: ["available", "day_off"], required: true },
    startTime: {
      type: String,
      required: function () {
        return this.status === "available";
      },
    },
    endTime: {
      type: String,
      required: function () {
        return this.status === "available";
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Availability", availabilitySchema);
