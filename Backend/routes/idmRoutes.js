import express from "express";
import { verifyToken as protect } from "../middleware/authMiddleware.js"; 
import {
    createProgram,
    getPatientPrograms,
    updateProgram,
    addMetric,
    getPatientMetrics
} from "../controllers/idmController.js";

const router = express.Router();

router.post("/programs", protect, createProgram);
router.get("/programs/:patientId", protect, getPatientPrograms);
router.put("/programs/:id", protect, updateProgram);

router.post("/metrics", protect, addMetric);
router.get("/metrics/:patientId", protect, getPatientMetrics);

export default router;
