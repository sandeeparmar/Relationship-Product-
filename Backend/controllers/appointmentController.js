import { Appointment } from "../models/Appointment.js";
import { mongoose } from "mongoose";
import { doctor } from "../models/Doctor.js" ;
import { calculateWaitingTime } from "../utils/waitingTime.js";

export const bookAppointment = async (req, res) => {
  const {doctorId , date , timeSlot} = req.body ;

  if(req.user.role !== "PATIENT"){
     return res.status(403).json({
      message : "Only patients can book appointments"
     }) ;
  }

  const existingAppointment = await Appointment.findOne({
    patientId : req.user.id ,
    status : {$in:["BOOKED" , "IN_PROGRESS" , "PENDING"]}  
  }) ;

  if(existingAppointment){
    return res.status(400).json({
      message : "You already have an Active Appoinement"
    }) ;
  }

  const count = await Appointment.countDocuments({
    doctorId ,
    date ,
    timeSlot 
  }) ;


  const appointment = await Appointment.create({
    patientId : req.user.id ,
    doctorId ,
    date , 
    timeSlot ,
    queueNumber : count+1 
  }) ;
   res.status(201).json(appointment) ; 
} ;

export const getDoctorAppointments  = async (req , res) => {

  if(req.user.role !== "DOCTOR") {
    return res.status(403).json({message : "Access Denied"}) ;
  }

  const doctor1 = await doctor.findById(req.params.id) ;
 
  if(!doctor1) {
    return res.status(404).json({message : "Doctor Not Found"}) ;
  }
  
  const appointments = await Appointment.find({
    doctorId : req.params.id ,
    status : {$in :["BOOKED" , "IN_PROGESS"]} 
    }).sort("queueNumber") ;

    const withWaitingTime = appointments.map(a => ({
      ...a.doc ,
      withWaitingTime :calculateWaitingTime(
          a.queueNumber ,
          doctor.consultationTime 
      )
    })) ;
    res.json(withWaitingTime) ;
} ;

export const updateStatus = async (req ,res) => { 
  const session = await mongoose.startSession() ;
  session.startTransaction() ;
  try{
    let {status} = req.body ;
    status = status.toUpperCase() ;
    
    if(req.user.role !== "DOCTOR"){
      return res.status(403).json("your role is " , req.user.role) ;
    } 
    
    const appointment = await Appointment.findById(req.params.id).session(session) ;
    
    if(!appointment){
      return res.status(404).json({
        message : "Appointment not found"
      }) ;
    }
    
    if(appointment.status === "COMPLETED"){
      return res.status(400).json({
        message : "This appointment is already completed and locked"
      }) ;
    }
    
    const oldQueueNumber = appointment.queueNumber ;
    appointment.status = status ;
    await appointment.save({session}) ;
    

    if(status === "COMPLETED") {
      await Appointment.updateMany(
        {
          doctorId : appointment.doctorId ,
          date : appointment.date ,
          timeSlot : appointment.timeSlot ,
          status : {$in:["BOOKED" , "IN_PROGRESS"]} ,
          queueNumber : {$gt : oldQueueNumber}
        }, {
          $inc : {queueNumber : -1}
        }) ;
      }

      await session.commitTransaction() ;
      session.endSession() ; 
      
      const io = req.app.get("io") ;
      
      io.to(String(appointment.doctorId)).emit("queueUpdated" , {
         doctorId : appointment.doctorId 
      }) ;

      res.json({
        message : "Status updated successfully" ,
        appointment 
      })
    }
    catch(err) {
      await session.abortTransaction() ;
      session.endSession() ;

      res.status(400).json({
        message : error.message 
      }) ;
    }
} ;

export const confirmAppointment = async (req , res) => {
    const count = await Appointment.countDocuments({
      doctorId : req.body.doctorId ,
      date : req.body.date ,
      timeSlot : req.body.timeSlot ,
      status : "BOOKED" 
    }) ;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id ,
      {
        status : "BOOKED" ,
        queueNumber : count+1 
      } ,
      {new : true}
    ) ;
    res.json({
      message : "Appointment Confirmed" ,
      appointment 
    }) ;
} ;