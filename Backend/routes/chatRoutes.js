import express from "express" ;
import {middle} from "../middleware/authMiddleware.js" ;
import upload from "../middleware/uploadAudio.js" ;

const router = express.Router() ;

import {
  createRoom ,
  getMessages ,
  sendTextMessage ,
  sendAudioMessage,
  getConversationHistory
}  from "../controllers/chatController.js" ;

router.post("/room" , middle , createRoom) ;

router.get("/:roomId" , middle , getMessages)  ;

router.post("/text" ,middle , sendTextMessage); 

router.post("/audio" , middle , upload.single("audio") , sendAudioMessage) ;

router.get("/history/:roomId" , middle , getConversationHistory) ;

export default router ;




