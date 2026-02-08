import { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { socket } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";

export default function DoctorDashboard() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  const loadQueue = async () => {
    try {
      // route is /doctor/:id but controller ignores ID and uses req.user.id
      const res = await api.get("/appointments/doctor");
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to load queue", err);
    }
  };

  useEffect(() => {
    loadQueue();
    // Use user.id for room if possible, else generic
    const room = user?.id ? String(user.id) : "doctor";
    socket.emit("joinDoctorRoom", room);

    socket.on("queueUpdated", () => {
      loadQueue();
    });

    return () => {
      socket.off("queueUpdated");
    };
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      loadQueue();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const confirmAppointment = async (id) => {
    try {
      await api.patch(`/appointments/${id}/confirm`, {});
      loadQueue();
      alert("Appointment Confirmed!");
    } catch (err) {
      console.error(err);
      alert("Failed to confirm appointment");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "BOOKED": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "IN_PROGRESS": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "COMPLETED": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const pendingAppointments = appointments.filter(a => a.status === "PENDING");
  const activeAppointments = appointments.filter(a => ["BOOKED", "IN_PROGRESS"].includes(a.status));

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Doctor Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your patient appointments and queue</p>
      </header>

      {/* Pending Requests Section */}
      <section>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">New Appointment Requests</h3>
        {pendingAppointments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">No pending requests.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingAppointments.map(a => (
              <div key={a._id} className="bg-yellow-50 dark:bg-gray-800 border border-yellow-200 dark:border-yellow-900 shadow rounded-lg p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Request</h4>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(a.status)}`}>
                      {a.status}
                    </span>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Date: <span className="font-semibold">{a.date}</span></p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Slot: <span className="font-semibold">{a.timeSlot}</span></p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Patient ID: {a.patientId}</p>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => confirmAppointment(a._id)}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Confirm Appointment
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.post("/chat/room", {
                          doctorId: user.id,
                          patientId: a.patientId
                        });
                        navigate(`/chat/${res.data._id}`);
                      } catch (err) {
                        console.error(err);
                        alert("Failed to open chat");
                      }
                    }}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:border-gray-600"
                  >
                    Chat with Patient
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Queue Section */}
      <section>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Active Queue</h3>
        {activeAppointments.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No active appointments in the queue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeAppointments.map(a => (
              <div key={a._id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Queue #{a.queueNumber}</h3>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(a.status)}`}>
                      {a.status}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Waiting Time: <span className="font-semibold text-gray-900 dark:text-white">{a.waitingTime} mins</span></p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Patient ID: <span className="text-sm font-normal text-gray-500">{a.patientId}</span></p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Date: {a.date} | {a.timeSlot}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col space-y-2">
                  {a.status === "BOOKED" && (
                    <button
                      onClick={() => updateStatus(a._id, "IN_PROGRESS")}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Start Consultation
                    </button>
                  )}

                  {a.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => updateStatus(a._id, "COMPLETED")}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Complete Consultation
                    </button>
                  )}

                  <button
                    onClick={async () => {
                      try {
                        const res = await api.post("/chat/room", {
                          doctorId: user.id,
                          patientId: a.patientId
                        });
                        navigate(`/chat/${res.data._id}`);
                      } catch (err) {
                        console.error(err);
                        alert("Failed to open chat");
                      }
                    }}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:border-gray-600"
                  >
                    Open Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
