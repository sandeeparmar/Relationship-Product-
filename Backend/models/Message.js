import mongoose from "mongoose" ;

const messageSchema = new mongoose.Schema( { 
  roomId : {
     type : mongoose.Schema.Types.ObjectId ,
     ref :"ChatRoom" ,
     requried : true 
  } ,
  senderId : {
    type : mongoose.Schema.Types.ObjectId ,
    ref : "User" ,
    requried : true 
  },
  type : {
    type : String ,
    enum : ["TEXT" , "AUDIO"] ,
    default :"TEXT" ,
    required : true 
   } ,
   content : {
    type : String ,
    required : true 
   } ,
   delivered : {
      type : Boolean ,
      default : false 
   } , 
   originalLanguage : String ,
   translatedLanguage : String ,
   translatedContent : String , 
   seen : {
    type : Boolean , 
    default : false 
  }
} , {timestamps:true}) ;

export const Message = mongoose.model("Message",messageSchema) ;