import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {connectDB} from "./config/db.js" ;
import appointmentRoutes from "./routes/appointmentRoutes.js" ;
import authRoutes from "./routes/authRoutes.js" ;
import cookieParser from "cookie-parser";
dotenv.config() ;
connectDB() ;

const app = express();

app.use(cors()) ;
app.use(express.json());
app.use(cookieParser()) ;


app.use("/api/auth", authRoutes) ;
app.use("/api/appointments", appointmentRoutes) ;



app.listen(process.env.PORT , () =>{
  console.log(`Server is running on port ${process.env.PORT}`);
}) ;