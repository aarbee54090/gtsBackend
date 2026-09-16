const Availability = require("../models/Availability");
const Appointment = require("../models/Appointment");

// Normalizes any date input to UTC midnight, so the same calendar day
// always maps to the same stored value regardless of the time-of-day or
// timezone offset in the client's original date string.
function normalizeDate(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function isValidTime(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

// GET /api/appointments/availability
// Public. Feeds the customer date picker and the admin's own list - both
// only ever care about today onward.
async function listAvailability(req, res) {
  try {
    const today = normalizeDate(new Date());
    const entries = await Availability.find({ date: { $gte: today } }).sort({ date: 1 });
    res.json({ success: true, count: entries.length, data: entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/appointments/availability
// Admin only. Upserts one date's availability - re-saving the same date
// overwrites its previous entry (e.g. switching Available -> Day Off)
// instead of creating a duplicate.
async function setAvailability(req, res) {
  try {
    const { date, status, startTime, endTime } = req.body;
    const normalized = normalizeDate(date);
    if (!normalized) {
      return res.status(400).json({ success: false, message: "Valid date is required" });
    }
    if (!["available", "day_off"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'available' or 'day_off'" });
    }

    let update;
    if (status === "available") {
      if (!isValidTime(startTime) || !isValidTime(endTime)) {
        return res
          .status(400)
          .json({ success: false, message: "Valid startTime and endTime (HH:mm) are required" });
      }
      if (startTime >= endTime) {
        return res.status(400).json({ success: false, message: "startTime must be before endTime" });
      }
      update = { $set: { date: normalized, status, startTime, endTime } };
    } else {
      // $unset clears any leftover time range from a previous "available" entry.
      update = { $set: { date: normalized, status }, $unset: { startTime: "", endTime: "" } };
    }

    const entry = await Availability.findOneAndUpdate({ date: normalized }, update, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/appointments/availability/:id
async function deleteAvailability(req, res) {
  try {
    const entry = await Availability.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: "Availability entry not found" });
    }
    res.json({ success: true, data: entry });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/appointments
// Public/guest - no login required. Validates the requested date is marked
// available and the requested time falls within that date's open range.
async function createAppointment(req, res) {
  try {
    const { date, time, name, phone, note } = req.body;

    const normalized = normalizeDate(date);
    if (!normalized) {
      return res.status(400).json({ success: false, message: "Valid date is required" });
    }
    if (!isValidTime(time)) {
      return res.status(400).json({ success: false, message: "Valid time (HH:mm) is required" });
    }
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Name and phone are required" });
    }

    const availability = await Availability.findOne({ date: normalized });
    if (!availability || availability.status !== "available") {
      return res.status(400).json({ success: false, message: "That date is not available for booking" });
    }
    if (time < availability.startTime || time > availability.endTime) {
      return res.status(400).json({
        success: false,
        message: `Time must be between ${availability.startTime} and ${availability.endTime}`,
      });
    }

    const appointment = await Appointment.create({ date: normalized, time, name, phone, note });

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/appointments/admin/all
async function adminListAppointments(req, res) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const appointments = await Appointment.find(filter).sort({ date: 1, time: 1 });
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PATCH /api/appointments/admin/:id/status
async function adminUpdateAppointmentStatus(req, res) {
  try {
    const { status, adminNotes } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    res.json({ success: true, data: appointment });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid appointment id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  listAvailability,
  setAvailability,
  deleteAvailability,
  createAppointment,
  adminListAppointments,
  adminUpdateAppointmentStatus,
};
