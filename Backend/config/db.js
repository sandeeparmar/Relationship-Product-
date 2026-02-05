import mongoose from "mongoose";

export const connectDB = async () => {
    try{
      await mongoose.connect(process.env.MONGO_URI) ;
      console.log("Connected to the mongodb database") ;
    }
    catch(err){
      console.log(err.message) ;
      process.exit(1) ;
    }
} ;
