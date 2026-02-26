import express from "express";
import { exportPatientODM } from "../controllers/odmController.js";
import { verifyToken as protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id/export", protect, exportPatientODM);

export default router;
