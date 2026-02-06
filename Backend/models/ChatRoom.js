import {mongoose} from "mongoose";

const chatRoomSchema = new mongoose.Schema({
  doctorId : {
    type : mongoose.Schema.Types.ObjectId ,
    ref : "User"
   } ,
  patientId : {
    type : mongoose.Schema.Types.ObjectId ,
    ref : "User"     
  }
} , {timestamps : true}) ;

export const chatRoom = mongoose.model("ChatRoom" , chatRoomSchema) ;