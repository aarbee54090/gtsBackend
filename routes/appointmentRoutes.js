const express = require("express");
const {
  listAvailability,
  setAvailability,
  deleteAvailability,
  createAppointment,
  adminListAppointments,
  adminUpdateAppointmentStatus,
} = require("../controllers/appointmentController");
const requireAdmin = require("../middlewares/requireAdmin");

const router = express.Router();

router.get("/availability", listAvailability);
router.post("/availability", requireAdmin, setAvailability);
router.delete("/availability/:id", requireAdmin, deleteAvailability);
router.get("/admin/all", requireAdmin, adminListAppointments);
router.patch("/admin/:id/status", requireAdmin, adminUpdateAppointmentStatus);
router.post("/", createAppointment);

module.exports = router;
