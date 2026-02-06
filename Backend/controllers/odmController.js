import {User} from "../models/User.js" ;
import {ConversationSummary} from "../models/ConversationSummary.js" ;
import { generateODM } from "../services/odmService.js";

export const exportPatientODM = async(req , res) => { 
  
  const patient = await User.findById(req.params.id) ;

  const encounters = await ConversationSummary.find({
    patientId : patient._id 
  }) ;

  const odmXML = generateODM(patient , encounters) ;
  
  res.set("Content-Type" , "application/xml") ;
  res.send(odmXML) ;
} ;