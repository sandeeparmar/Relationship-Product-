import express from "express" ;
const router = express.Router() ;

import {Doctor} from "../models/Doctor.js" ;

router.get("/" , async(req ,res)   => {
   const doctors = await Doctor.find().populate("userId" , "name email") ; // find() its find all documents in the doctors collection
   res.json(doctors)  ;
}) ;

export default router ;