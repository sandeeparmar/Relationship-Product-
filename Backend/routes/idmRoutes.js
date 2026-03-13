import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js"; 
import {
    createProgram,
    getPatientPrograms,
    updateProgram,
    addMetric,
    getPatientMetrics
} from "../controllers/idmController.js";

const router = express.Router();

router.post("/programs", verifyToken, createProgram);

router.get("/programs/:patientId", verifyToken, getPatientPrograms);

router.put("/programs/:id", verifyToken, updateProgram);

router.post("/metrics", verifyToken, addMetric);

router.get("/metrics/:patientId", verifyToken, getPatientMetrics);

export default router;
