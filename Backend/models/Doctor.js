import mongoose from "mongoose";
const doctorSchema = new mongoose.Schema({
   userId : {
     type : mongoose.Schema.Types.ObjectId ,
     ref : "User" 
   } ,
   specialization : String ,
   consultationTime :{
      type : String ,
      default : 15 
    }
}) ;

export const Doctor = mongoose.model("Doctor" , doctorSchema) ;