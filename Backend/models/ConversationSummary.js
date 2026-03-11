import mongoose from "mongoose" ;

const schema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatRoom",
    required: true,
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  summary: {
    type: String,
    required: true
  }
} , {timestamps : true}) ;

export const ConversationSummary = mongoose.model("ConversationSummary" , schema) ;