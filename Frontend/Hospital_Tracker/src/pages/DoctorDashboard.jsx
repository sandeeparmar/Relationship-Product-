import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { socket } from "../context/SocketContext";

export default function DoctorDashboard() {

  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  const loadQueue = async () => {
    const res = await api.get("/appointments/doctor");
    setAppointments(res.data);
  };

  useEffect(() => {
  loadQueue();

  socket.emit("joinDoctorRoom", "doctor");

  socket.on("queueUpdated", () => {
    loadQueue();
  });

}, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/appointments/${id}/status`, { status });
    loadQueue();
  };

  return (
    <div>

      <h2>Doctor Dashboard</h2>

      {appointments.map(a => (
        <div key={a._id} style={{border:"1px solid #ccc",margin:10,padding:10}}>

          <p>Patient: {a.patientId}</p>
          <p>Status: {a.status}</p>
          <p>Queue: {a.queueNumber}</p>
          <p>Waiting Time: {a.waitingTime} mins</p>

          {a.status === "BOOKED" && (
            <button onClick={()=>updateStatus(a._id,"IN_PROGRESS")}>
              Start
            </button>
          )}

          {a.status === "IN_PROGRESS" && (
            <button onClick={()=>updateStatus(a._id,"COMPLETED")}>
              Complete
            </button>
          )}

          <button onClick={()=>navigate(`/chat/${a.patientId}`)}>
            Open Chat
          </button>

        </div>
      ))}

    </div>
  );
}
