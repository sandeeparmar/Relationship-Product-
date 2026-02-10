import mongoose from "mongoose" ;

const schema = new mongoose.Schema({
  roomId : mongoose.Schema.Types.ObjectId ,
  summary : String 
} , {timestamps : true}) ;

export const ConversationSummary = mongoose.model("ConversationSummary" , schema) ;