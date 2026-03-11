import {User} from "../models/User.js" ;
import {ConversationSummary} from "../models/ConversationSummary.js" ;
import { generateODM } from "../services/odmService.js";
import { Appointment } from "../models/Appointment.js";  
import { Doctor } from "../models/Doctor.js";


export const exportPatientODM = async (req, res) => {
  try {
    const { role, id: requesterId } = req.user;
    const targetPatientId = req.params.id;


    if (role === "PATIENT") {
      if (requesterId !== targetPatientId) {
        return res.status(403).json({
          error: "Access denied. Patients can only export their own ODM data.",
        });
      }
    } else if (role === "DOCTOR") {
      const doctorProfile = await Doctor.findOne({ userId: requesterId }).select("_id");

      if (!doctorProfile) {
        return res.status(403).json({
          error: "Access denied. Doctor profile not found.",
        });
      }

      const treats = await Appointment.exists({
        doctorId: doctorProfile._id,
        patientId: targetPatientId,
      });

      if (!treats) {
        return res.status(403).json({
          error: "Access denied. You are not associated with this patient.",
        });
      }
    } else if (role === "ADMIN") {
      // Admin can export for any patient
    } else {
      return res.status(403).json({ error: "Access denied. Unknown role." });
    }

    const patient = await User.findById(targetPatientId);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found." });
    }

    const encounters = await ConversationSummary.find({
      patientId: patient._id,
    });

    const odmXML = generateODM(patient, encounters);

    res.set("Content-Type", "application/xml");
    res.send(odmXML);
  } catch (err) {
    console.error("exportPatientODM error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};