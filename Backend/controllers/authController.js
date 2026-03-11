import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Doctor } from "../models/Doctor.js";
import validator from "validator" ;
import { sendEmail } from "../services/emailService.js";

export const register = async (req, res) => {
  let { name, email, password, role, phone, preferredLanguage, specialization, consultationTime } = req.body;

  // if ( !validator.isEmail(email) || !/^[6-9]\d{9}$/.test(phone) ||
  //           !validator.isAlpha(name, 'en-US', { ignore: ' ' }) ||
  //        !validator.isNumeric(consultationTime)
  //   ) {
  //     return res.status(400).json({ message: "Fields must be valid" });
  // }
  const check = await User.findOne({ email });
  
  if (check) {
    return res.status(409).json({ message: "Already Registered this email" });
  }
  
  try{
    const token = jwt.sign({email} , process.env.JWT_SECRET , {expiresIn : "5m"}) ;
  
    const verificationLink = `http://localhost:5000/verify-email/${token}`;
  
    const subject = "Verify Your Email" ;
    const text = `Hello Mr/Ms. ${name} first u need to confirm your mail .\n Click below to verify your email \n
      ${verificationLink} Verify Email</a>`  ;
     await sendEmail(email , subject  ,text ) ;      
 

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
   }
  catch(err){
    console.log(err.message) ;
    return res.status(400).json({message : "please enter working mail.."}) ;
  }
};

export const login = async (req, res) => {
  
  const { email, password } = req.body;
  
  if (!validator.isEmail(email)) {
  return res.status(400).json({ message: "Email must be valid" });
  }


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