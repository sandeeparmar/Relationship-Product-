import express from "express";

const router = express.Router();
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  bookAppointment,
  confirmAppointment,
  getDoctorAppointments,
  updateStatus,
  denyAppointment
} from "../controllers/appointmentController.js";

router.post("/", verifyToken, bookAppointment);

router.get("/doctor", verifyToken, getDoctorAppointments);

router.patch("/:id/status", verifyToken, updateStatus);

router.patch("/:id/confirm", verifyToken, confirmAppointment);

router.patch("/:id/deny", verifyToken, denyAppointment);

export default router;