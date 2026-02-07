import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {

  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [appointment, setAppointment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/doctors").then(res => setDoctors(res.data));
  }, []);

  const book = async () => {
    const res = await api.post("/appointments", {
      doctorId,
      date,
      timeSlot
    });
    setAppointment(res.data.appointment || res.data);
  };

  return (
    <div>
      <h2>Patient Dashboard</h2>

      <select onChange={e=>setDoctorId(e.target.value)}>
        <option>Select Doctor</option>
        {doctors.map(d => (
          <option key={d._id} value={d._id}>
            {d.userId.name} ({d.specialization})
          </option>
        ))}
      </select>

      <input type="date" onChange={e=>setDate(e.target.value)} />
      <input placeholder="Time Slot" onChange={e=>setTimeSlot(e.target.value)} />

      <button onClick={book}>Book</button>

      {appointment && (
        <button onClick={()=>navigate(`/chat/${appointment._id}`)}>
          Open Chat
        </button>
      )}
    </div>
  );
}
