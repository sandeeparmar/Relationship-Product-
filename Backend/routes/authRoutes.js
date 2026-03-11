import express from "express";

const router = express.Router();
import { register, login, logout, verifyEmail } from "../controllers/authController.js";

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify-email/:token", verifyEmail);

export default router;