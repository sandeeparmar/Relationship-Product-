import {mongoose} from "mongoose" ;

const diseaseProgramSchema = new mongoose.Schema({
  diseaseName : String ,
  patientId : mongoose.Schema.Types.ObjectId ,
  carePlan : {
    medications : [String] ,
    followUps : [String] ,
    lifestyleAdvice : [String] 
  } ,
  assignedDoctor : mongoose.Schema.Types.ObjectId ,
  status : {
    type : String ,
    enum : [ "ACTIVE" , "STABLE" , "CRITICAL"]
   }
}) ;

export const diseaseSchema = mongoose.model("DiseaseProgram" , diseaseProgramSchema) ;