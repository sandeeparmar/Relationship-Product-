import express from "express" ;

const router = express.Router() ;
import {middle} from "../middleware/authMiddleware.js" ;
import {
  bookAppointment ,
  confirmAppointment,
  getDoctorAppointments ,
  updateStatus
} from "../controllers/appointmentController.js"; 

router.post("/" , middle , bookAppointment) ;

router.get("/doctor/:id"  ,middle , getDoctorAppointments) ;

router.patch("/:id/status" , middle , updateStatus) ;

router.patch("/:id/confirm" , middle , confirmAppointment) ;

export default router ;