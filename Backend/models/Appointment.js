import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor"
  },
  date: String,
  timeSlot: String,
  reason: { type: String, default: "General Consultation" },
  queueNumber: Number,
  status: {
    type: String,
    enum: ["PENDING", "BOOKED", "IN_PROGRESS", "COMPLETED", "REJECTED", "CANCELLED"],
    default: "PENDING"
  }
});

export const Appointment = mongoose.model("Appointment", appointmentSchema);