import express from "express";

const router = express.Router();
import { middle } from "../middleware/authMiddleware.js";
import {
  bookAppointment,
  confirmAppointment,
  getDoctorAppointments,
  updateStatus,
  denyAppointment
} from "../controllers/appointmentController.js";

router.post("/", middle, bookAppointment);

router.get("/doctor", middle, getDoctorAppointments);

router.patch("/:id/status", middle, updateStatus);

router.patch("/:id/confirm", middle, confirmAppointment);

router.patch("/:id/deny", middle, denyAppointment);

export default router;