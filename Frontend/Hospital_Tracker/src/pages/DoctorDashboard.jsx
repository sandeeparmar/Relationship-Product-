import { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { socket } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import VideoCall from "../components/VideoCall";
import IDMPanel from "../components/IDMPanel";

export default function DoctorDashboard() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [expandedPatientId, setExpandedPatientId] = useState(null);
  const navigate = useNavigate();

  const loadQueue = async () => {
    try {
      const res = await api.get("/appointments/doctor");
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to load queue", err);
    }
  };

  useEffect(() => {
    loadQueue();
    const room = user?.id ? String(user.id) : "doctor";
    socket.emit("joinDoctorRoom", room);
    socket.on("queueUpdated", () => { loadQueue(); });
    return () => { socket.off("queueUpdated"); };
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

  const getStatusBadge = (status) => {
    const map = {
      PENDING:     "bg-amber-100 text-amber-700 ring-1 ring-amber-300",
      BOOKED:      "bg-sky-100 text-sky-700 ring-1 ring-sky-300",
      IN_PROGRESS: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300",
      COMPLETED:   "bg-slate-100 text-slate-600 ring-1 ring-slate-300",
      CANCELLED:   "bg-red-100 text-red-700 ring-1 ring-red-300",
    };
    return map[status] || "bg-slate-100 text-slate-600";
  };

  const openChat = async (doctorId, patientId) => {
    try {
      const res = await api.post("/chat/room", { doctorId, patientId });
      navigate(`/chat/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to open chat");
    }
  };

  const pendingAppointments = appointments.filter(a => a.status === "PENDING");
  const activeAppointments  = appointments.filter(a => ["BOOKED", "IN_PROGRESS"].includes(a.status));

  return (
    <div className="min-h-screen bg-sky-150 px-6 py-10 space-y-12">

      {/* ── Page Header ── */}
      <header className="flex items-end justify-between border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-teal-500 mb-1">
            Doctor Portal
          </p>
          <h1 className="text-4xl font-bold text-slate-900 leading-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your patient appointments and queue
          </p>
        </div>

        {/* Stats pills */}
        <div className="hidden md:flex gap-3">
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <p className="text-2xl font-bold text-amber-600">{pendingAppointments.length}</p>
            <p className="text-xs text-amber-500 font-medium">Pending</p>
          </div>
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <p className="text-2xl font-bold text-emerald-600">{activeAppointments.length}</p>
            <p className="text-xs text-emerald-500 font-medium">Active</p>
          </div>
        </div>
      </header>

      {/* ── Pending Requests ── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-amber-400 rounded-full" />
          <h2 className="text-xl font-bold text-slate-800">New Appointment Requests</h2>
          {pendingAppointments.length > 0 && (
            <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {pendingAppointments.length} pending
            </span>
          )}
        </div>

        {pendingAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">No pending requests right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pendingAppointments.map(a => (
              <div
                key={a._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden"
              >
                {/* Card top accent */}
                <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-400" />

                <div className="p-5 flex flex-col flex-1">
                  {/* Patient name + status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                        {(a.patientId?.name || "?")[0].toUpperCase()}
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 leading-tight">
                        {a.patientId?.name || "Unknown Patient"}
                      </h3>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getStatusBadge(a.status)}`}>
                      {a.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 mb-5 flex-1">
                    <InfoRow label="Phone"  value={a.patientId?.phone || "N/A"} />
                    <InfoRow label="Reason" value={a.reason || "General Consultation"} italic />
                    <InfoRow label="Date"   value={`${a.date}  ·  ${a.timeSlot}`} />
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmAppointment(a._id)}
                        className="flex-1 py-2 text-sm font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(a._id, "CANCELLED")}
                        className="flex-1 py-2 text-sm font-semibold rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors"
                      >
                        Deny
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (!user?.id) { alert("User not loaded yet"); return; }
                        openChat(user.id, a.patientId);
                      }}
                      className="w-full py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      Chat with Patient
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Active Queue ── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-teal-400 rounded-full" />
          <h2 className="text-xl font-bold text-slate-800">Active Queue</h2>
          {activeAppointments.length > 0 && (
            <span className="ml-auto bg-teal-100 text-teal-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {activeAppointments.length} active
            </span>
          )}
        </div>

        {activeAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">No active appointments in the queue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeAppointments.map(a => (
              <div
                key={a._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden"
              >
                {/* Card top accent — teal for BOOKED, emerald for IN_PROGRESS */}
                <div className={`h-1.5 ${a.status === "IN_PROGRESS" ? "bg-gradient-to-r from-emerald-400 to-teal-400" : "bg-gradient-to-r from-sky-400 to-blue-400"}`} />

                <div className="p-5 flex flex-col flex-1">
                  {/* Queue # + status */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold tracking-widest uppercase text-slate-400">
                      Queue #{a.queueNumber}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getStatusBadge(a.status)}`}>
                      {a.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Patient name */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${a.status === "IN_PROGRESS" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>
                      {(a.patientId?.name || "?")[0].toUpperCase()}
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {a.patientId?.name || "Unknown Patient"}
                    </h3>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 mb-5 flex-1">
                    <InfoRow label="Phone"   value={a.patientId?.phone || "N/A"} />
                    <InfoRow label="Reason"  value={a.reason || "General Consultation"} italic />
                    <InfoRow label="Wait"    value={`${a.waitingTime} mins`} highlight />
                    <InfoRow label="Date"    value={`${a.date}  ·  ${a.timeSlot}`} />
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {a.status === "BOOKED" && (
                      <button
                        onClick={() => updateStatus(a._id, "IN_PROGRESS")}
                        className="w-full py-2 text-sm font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                      >
                        Start Consultation
                      </button>
                    )}

                    {a.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => updateStatus(a._id, "COMPLETED")}
                        className="w-full py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        Complete Consultation
                      </button>
                    )}

                    <button
                      onClick={() => openChat(user.id, a.patientId)}
                      className="w-full py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      Open Chat
                    </button>

                    {/* IDM Toggle */}
                    <button
                      onClick={() => setExpandedPatientId(expandedPatientId === a.patientId?._id ? null : a.patientId?._id)}
                      className="w-full py-2 text-sm font-semibold rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      {expandedPatientId === a.patientId?._id ? (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                          Hide IDM Panel
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          Manage Disease (IDM)
                        </>
                      )}
                    </button>

                    {expandedPatientId === a.patientId?._id && (
                      <div className="mt-1 rounded-xl border border-slate-200 overflow-hidden">
                        <IDMPanel patientId={a.patientId?._id} patientName={a.patientId?.name} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoRow({ label, value, italic, highlight }) {
  return (
    <div className="flex items-baseline gap-1.5 text-sm">
      <span className="text-slate-400 font-medium w-14 flex-shrink-0">{label}</span>
      <span className={`${italic ? "italic" : ""} ${highlight ? "font-bold text-slate-900" : "text-slate-600"} truncate`}>
        {value}
      </span>
    </div>
  );
}