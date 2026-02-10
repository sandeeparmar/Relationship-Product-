import express from "express";
import { updateUserProfile, getUserProfile } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user profile
router.get("/profile", verifyToken, getUserProfile);

// Update user profile (including preferred language)
router.put("/profile", verifyToken, updateUserProfile);

export default router;
