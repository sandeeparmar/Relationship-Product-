import { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PatientDashboard() {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({ doctorId: "", date: "", timeSlot: "", reason: "" });
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/doctors").then(res => setDoctors(res.data)).catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const book = async (e) => {
    e.preventDefault();
    if (!formData.doctorId || !formData.date || !formData.timeSlot) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/appointments/", formData);
      setAppointment(res.data.appointment || res.data);
      setFormData({ doctorId: "", date: "", timeSlot: "", reason: "" });
      alert("Appointment booked successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const openChat = async () => {
    try {
      const docProfile = doctors.find(d => d._id === appointment.doctorId);
      const docUserId = docProfile?.userId?._id || docProfile?.userId;
      if (!docUserId) { alert("Could not identify doctor user ID"); return; }
      const res = await api.post("/chat/room", { doctorId: docUserId, patientId: user.id });
      navigate(`/chat/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to open chat");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 space-y-10">

      {/* ── Page Header ── */}
      <header className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-teal-500 mb-1">
          Patient Portal
        </p>
        <h1 className="text-4xl font-bold text-slate-900 leading-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Book and manage your appointments</p>
      </header>

      {/* ── Booking Form Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Card header accent */}
        <div className="h-1.5 bg-gradient-to-r from-teal-400 to-sky-400" />

        <div className="p-7">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-9 h-9 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Book New Appointment</h2>
              <p className="text-xs text-slate-400">Fill in the details below to schedule a visit</p>
            </div>
          </div>

          <form onSubmit={book} className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Select Doctor */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase text-slate-500">
                Select Doctor
              </label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:bg-white"
              >
                <option value="">— Select a Doctor —</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.userId?.name || "Unknown Doctor"} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase text-slate-500">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:bg-white"
              />
            </div>

            {/* Time Slot */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase text-slate-500">
                Time Slot
              </label>
              <input
                type="text"
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleChange}
                placeholder="e.g. 10:00 AM"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-300 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:bg-white"
              />
            </div>

            {/* Reason — full width */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold tracking-widest uppercase text-slate-500">
                Reason for Visit
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={3}
                placeholder="Briefly describe your symptoms or reason for visit..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-300 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:bg-white resize-none"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-700 active:scale-[0.99] text-white text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Booking...
                  </span>
                ) : "Book Appointment"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Success Banner ── */}
      {appointment && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400" />
          <div className="p-6 flex items-start gap-4">

            {/* Icon */}
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900 mb-1">Appointment Booked!</h3>
              <p className="text-sm text-slate-500 mb-4">
                Your appointment ID is{" "}
                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                  {appointment._id}
                </span>
                . You can verify the status in your list.
              </p>
              <button
                onClick={openChat}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Open Chat Support
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}