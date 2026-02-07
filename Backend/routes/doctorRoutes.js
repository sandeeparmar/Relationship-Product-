import express from "express" ;
const router = express.Router() ;

import {Doctor} from "../models/Doctor.js" ;

router.get("/" , async(req ,res)   => {
   const doctors = await Doctor.find().populate("userId" , "name email") ;
   res.json(doctors)  ;
}) ;

export default router ;