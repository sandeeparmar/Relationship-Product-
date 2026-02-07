import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {
      type : String ,
      required : true
    } ,
    email : {
      type : String ,
      unique : true ,
      required : true ,
      lowercase : true ,
      trim : true
    } ,   
    phone : {
      type : String ,
      required : true 
    } ,
    password : {
      type : String ,
      required : true 
    } , 
    role : {
      type : String ,
       enum : ["PATIENT" , "DOCTOR" , "ADMIN"] ,
       default : "PATIENT" ,
    }, 
    preferredLanguage : {
      type : String ,
      default :"en" 
    }
}) ;

export const User = mongoose.model("User" , userSchema) ;