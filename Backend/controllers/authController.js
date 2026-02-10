import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Doctor } from "../models/Doctor.js";

export const register = async (req, res) => {
  let { name, email, password, role, phone, preferredLanguage, specialization, consultationTime } = req.body;

  const check = await User.findOne({ email });

  if (check) {
    return res.status(409).json({ message: "Already Registered this email" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  role = role.toUpperCase();

  const user = await User.create({ name, email, password: hashedPassword, role, phone, preferredLanguage });

  if (role === "DOCTOR") {
    await Doctor.create({
      userId: user._id,
      specialization: specialization || "General",
      consultationTime: consultationTime || 15
    });
  }



  res.status(201).json({ message: "User Registered" });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "Invalid Credentials" });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000
  });

  res.json({ success: true, user: { id: user._id, name: user.name, role: user.role } });
};

export const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict'
  });
  res.json({ success: true, message: 'Logged out Successfully' });
};