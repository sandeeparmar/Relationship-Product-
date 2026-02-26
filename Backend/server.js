import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { connectDB } from "./config/db.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import chatRoutes from "./routes/chatRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import idmRoutes from "./routes/idmRoutes.js";
import odmRoutes from "./routes/odmRoutes.js";
dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  socket.on("joinDoctorRoom", (doctorId) => {
    socket.join(doctorId);
  });
  socket.on("joinChatRoom", (roomId) => {
    socket.join(roomId);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
    socket.broadcast.emit("callEnded");
  });


  // WebRTC Signaling Events
  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name
    });
  });

  socket.on("callRoom", (data) => {
    // Emit to the room (chat room ID)
    socket.to(data.roomId).emit("incomingCall", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
      callType: data.callType,
      callerSocketId: socket.id
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("endCall", (data) => {
    if (data.to) {
      io.to(data.to).emit("callEnded");
    }
  });

  // Handling ICE candidates if not using simple-peer's internal trickle (simple-peer handles it in signal)
  // But usually straightforward simple-peer usage encapsulates this in the signal data.
  // If we need manual ICE handling:
  // socket.on("ice-candidate", (data) => {
  //   io.to(data.to).emit("ice-candidate", data.candidate);
  // });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/doctors", doctorRoutes);
app.use("/api/idm", idmRoutes);
app.use("/api/odm", odmRoutes);

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});