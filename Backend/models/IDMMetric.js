import {mongoose} from "mongoose" ;

const idmMetricSchema = new mongoose.Schema({
  metricName : String ,
  category : {
    type :String ,
    enum : ["QUALITY" , "OUTCOME" , "PROCESS"] 
  } ,
  value : Number ,
  unit : String ,
  context  : {
    doctorId : mongoose.Schema.Types.ObjectId ,
    patientId : mongoose.Schema.Types.ObjectId ,
    disease : String 
  } 
} , {timestamps : true}) ;

export const idmMetric = mongoose.model("IDMMetric" , idmMetricSchema) ;