import {mongoose} from "mongoose" ;

const schema = new mongoose.Schema({
  roomId : mongoose.Schema.Types.ObjectId ,
  summary : String 
} , {timestamps : true}) ;

export const conversationSchema = mongoose.model("ConversationSummary" , schema) ;