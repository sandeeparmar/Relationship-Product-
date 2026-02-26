import express from "express";
import {
    createProgram,
    getPatientPrograms,
    updateProgram,
    addMetric,
    getPatientMetrics
} from "../controllers/idmController.js";
import { verifyToken as protect } from "../middleware/authMiddleware.js"; // Assuming you have an auth middleware

const router = express.Router();

// Program Routes
router.post("/programs", protect, createProgram);
router.get("/programs/:patientId", protect, getPatientPrograms);
router.put("/programs/:id", protect, updateProgram);

// Metric Routes
router.post("/metrics", protect, addMetric);
router.get("/metrics/:patientId", protect, getPatientMetrics);

export default router;
