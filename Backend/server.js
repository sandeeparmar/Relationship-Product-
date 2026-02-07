import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {createServer} from "http" ;
import {connectDB} from "./config/db.js" ;
import appointmentRoutes from "./routes/appointmentRoutes.js" ;
import authRoutes from "./routes/authRoutes.js" ;
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import  chatRoutes  from "./routes/chatRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
dotenv.config() ;
connectDB() ;

const app = express();
app.use(cors()) ;
app.use(express.json());
app.use(cookieParser()) ;

const server = createServer(app) ;
const io = new Server(server , {
  cors : {origin :"*"}
}) ;

app.set("io" , io) ;

io.on("connection" , (socket) =>{
  console.log("User Connected" , socket.id ) ;

  socket.on("joinDoctorRoom" , (doctorId) => {
      socket.join(doctorId) ;
  }) ;
  socket.on("joinChatRoom", (roomId) => {
    socket.join(roomId);
  });

  socket.on("disconnect" , () => {
    console.log("User Disconnected") ;
  }) ; 
}) ;

app.use("/api/auth", authRoutes) ;
app.use("/api/appointments", appointmentRoutes) ;
app.use("/api/chat" , chatRoutes) ;
app.use("/uploads" , express.static("uploads"));
app.use("/api/doctors" , doctorRoutes);

server.listen(process.env.PORT , () =>{
  console.log(`Server is running on port ${process.env.PORT}`);
}) ;