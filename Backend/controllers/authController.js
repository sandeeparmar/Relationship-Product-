import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Doctor } from "../models/Doctor.js";
import validator from "validator";
import { sendEmail } from "../services/emailService.js";

export const register = async (req, res) => {
  let {
    name,
    email,
    password,
    role,
    phone,
    preferredLanguage,
    specialization,
    consultationTime
  } = req.body;

  try {
    const existing = await User.findOne({ email });

    if (existing) {
      return res
        .status(409)
        .json({ message: "This email is already registered. Please log in." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    role = role.toUpperCase();

    // Encode full registration data in a short-lived token.
    const token = jwt.sign(
      {
        name,
        email,
        phone,
        hashedPassword,
        role,
        preferredLanguage,
        specialization,
        consultationTime
      },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    const verificationLink = `http://localhost:5000/api/auth/verify-email/${token}`;

    const subject = "Verify Your Email";
    const text = `Hello ${name},

Please verify your email address to activate your account.
Open this link in your browser:
${verificationLink}

If you did not create an account, you can ignore this email.`;

    const html = `
      <p>Hello ${name},</p>
      <p>Please verify your email address to activate your account.</p>
      <p>
        <a href="${verificationLink}" target="_blank" style="display:inline-block;padding:8px 16px;border-radius:6px;background:#0d9488;color:#ffffff;text-decoration:none;">
          Verify Email
        </a>
      </p>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p><a href="${verificationLink}" target="_blank">${verificationLink}</a></p>
      <p>If you did not create an account, you can ignore this email.</p>
    `;

    const emailInfo = await sendEmail(email, subject, text, html);
    if (!emailInfo) {
      return res
        .status(500)
        .json({ message: "Failed to send verification email. Please try again." });
    }

    res.status(201).json({
      message:
        "Verification email sent. Please check your inbox to complete registration."
    });
  } catch (err) {
    console.log(err.message);
    return res
      .status(400)
      .json({ message: "Failed to register. Please use a valid email." });
  }
};

export const login = async (req, res) => {
  
  const { email, password } = req.body;
  
  if (!validator.isEmail(email)) {
  return res.status(400).json({ message: "Email must be valid" });
  }


  const user = await User.findOne({ email });
  
  if (!user) return res.status(400).json({ message: "Invalid Credentials" });

  if (user.isEmailVerified === false) {
    return res
      .status(403)
      .json({ message: "Please verify your email before logging in." });
  }

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

export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.email) {
      return res.status(400).send("Invalid verification link.");
    }

    const {
      name,
      email,
      phone,
      hashedPassword,
      role,
      preferredLanguage,
      specialization,
      consultationTime
    } = decoded;

    let user = await User.findOne({ email });

    if (user) {
      // If user already exists, just mark verified (for older accounts)
      if (user.isEmailVerified === false) {
        user.isEmailVerified = true;
        await user.save();
      }
      return res.send(
        "Your email is already verified. You can now close this window and log in to your account."
      );
    }

    // Create user only after successful email verification
    user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      preferredLanguage,
      isEmailVerified: true
    });

    if (role === "DOCTOR") {
      await Doctor.create({
        userId: user._id,
        specialization: specialization || "General",
        consultationTime: consultationTime || 15
      });
    }

    return res.send(
      "Email verified and account created successfully. You can now close this window and log in to your account."
    );
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(410)
        .send("This verification link has expired. Please register again.");
    }
    console.error("Email verification error:", err.message);
    return res.status(400).send("Invalid verification link.");
  }
};

export const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict'
  });
  res.json({ success: true, message: 'Logged out Successfully' });
};