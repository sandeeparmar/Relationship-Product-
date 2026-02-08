import { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PatientDashboard() {
  const { user } = useContext(AuthContext);

  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    timeSlot: ""
  });
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // We need user to get patientId (current user)
  // But wait, the user is stored in AuthContext or accessible via localStorage if context not used in this file.
  // Better to use AuthContext.


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
      alert("Appointment booked successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Book and manage your appointments</p>
      </header>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Book New Appointment</h3>

        <form onSubmit={book} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Doctor</label>
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">-- Select a Doctor --</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>
                  {d.userId?.name || "Unknown Doctor"} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time Slot</label>
            <input
              type="text"
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleChange}
              placeholder="e.g. 10:00 AM"
              className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </form>
      </div>

      {appointment && (
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              {/* Check icon */}
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Appointment Confirmed</h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p>Your appointment ID is {appointment._id}. You can verify the status in your list.</p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.post("/chat/room", {
                          doctorId: appointment.doctorId,
                          patientId: user.id
                        });
                        navigate(`/chat/${res.data._id}`);
                      } catch (err) {
                        console.error(err);
                        alert("Failed to open chat");
                      }
                    }}
                    className="bg-green-100 dark:bg-green-800 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 dark:text-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Open Chat Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
