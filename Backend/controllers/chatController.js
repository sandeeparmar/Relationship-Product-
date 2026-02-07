import { chatRoom } from "../models/ChatRoom.js";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import {detectLanguage } from "../services/languageDetect.js" ;
import { translateText } from "../services/translationService.js";
import {encrypt , decrypt } from "../services/encryptionService.js"
import {generateSummary } from "../services/summaryService.js" ;
import {ConversationSummary} from "../models/ConversationSummary.js" ;


export const createRoom = async (req ,res) => {
  const {doctorId , patientId} = req.body ;
  let room = await chatRoom.findOne({doctorId , patientId}) ;
  if(!room) {
    room = await chatRoom.create({doctorId ,patientId}) ;
  }
  res.json(room) ; 
} ;

export const getMessages = async (req, res) => {
  const message = await Message.find({
    roomId : req.params.roomId 
  }).sort("createdAt") ;
  res.json(message) ;
} ;

export const sendTextMessage = async (req ,res) => {
   
  const sender = await User.findById(req.user.id) ;
  
  const room = await chatRoom.findById(req.body.roomId) ;
  
  const receiverId = String(room.doctorId) == String(sender._id) ? room.patientId: room.doctorId ;

  const receiver = await User.findById(receiverId) ;

   const detectedLang = await detectLanguage(req.body.text);

  const translated = await translateText(
    req.body.text ,
    detectedLang ,
    receiver.preferredLanguage 
  ) ;

   const encryptedOriginal = encrypt(req.body.text);
  const encryptedTranslated = encrypt(translated);


  const message = await Message.create({
    roomId: room._id,
    senderId: sender._id,
    senderRole: sender.role,
    type: "TEXT",

    content: encryptedOriginal,
    translatedContent: encryptedTranslated,
    
    originalLanguage: detectedLang,
    translatedLanguage: receiver.preferredLanguage
  }) ;

   const outgoingMessage = {
    ...message._doc,
    content: req.body.text,
    translatedContent: translated
  };

  const io  = req.app.get("io") ;
  io.to(req.body.roomId).emit("newMessage" , message);
  
  res.json(message) ;
}

export const sendAudioMessage = async (req ,res) =>  { 
  const message = await Message.create({
    roomId : req.body.roomId ,
    senderId : req.user.id ,
    senderRole : req.user.role ,
    content : req.file.path ,
    type:"AUDIO" 
  }) ;
  const io = req.app.get("io") ;
  io.to(req.body.roomId).emit("newMessage" , message) ;
  res.json(message) ;
} ;

export const getConversationHistory = async (req ,res) => {
    const message = await Message.find({
      roomId :req.params.roomId 
    }).sort({createdAt : 1}) ;
    res.json(message);
} ;

export const generateConversationSummary = async(req ,res) => {
   const room = await chatRoom.findById(req.params.roomId) ;

   if(!room){
    return res.status(404).json({message : "Room not found"}) ;
   }

   const message = await  Message.find({
    roomId : room._id 
   }).sort({createdAt : 1}) ;

   const plainText = message.map(m => m.translatedContent || m.content).join("\n") ; 

   const summary = await generateSummary(plainText) ;

   await ConversationSummary.create({
    roomId : room._id ,
    summary
    }) ;  

    if(summary.toLocaleLowerCase().includes("diabetes")) {
       await DiseaseProgram.create({
          diseaseName : "Diabetes" ,
          patientId : room.patientId ,
          assignedDoctor : room.doctorId ,
          carePlan : {
            medications : ["As prescribed"] ,
            followsUps :["Monthly blood Sugar test"] 
          }  ,
          status : "ACTIVE" 
       }) ;
    } 

    res.json({
      message : "Summary generated" ,
      summary 
    }) ;
} ; 