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
  date: {
    type : String ,
    required : true ,
  },
  timeSlot: {
    type : String ,
    required : true ,
  } ,
  reason: {
    type: String, 
    default: "General Consultation" 
  },
  queueNumber: Number,
  status: {
    type: String,
    enum: ["PENDING", "BOOKED", "IN_PROGRESS", "COMPLETED", "REJECTED", "CANCELLED"],
    default: "PENDING"
  }
});

export const Appointment = mongoose.model("Appointment", appointmentSchema);