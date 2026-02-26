import { useState } from "react";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "PATIENT",
    preferredLanguage: "en",
    specialization: "",
    consultationTime: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", formData);
      alert("Registration successful. Please login.");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-300 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:bg-white";

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── Left decorative panel ── */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full border border-teal-400/20" />
        <div className="absolute top-16 left-16 w-56 h-56 rounded-full border border-teal-400/10" />
        <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full border border-teal-400/20" />
        <div className="absolute -bottom-12 -right-12 w-72 h-72 rounded-full border border-teal-400/10" />

        {/* Logo */}
        <span className="relative z-10 text-2xl font-bold tracking-wide text-teal-400">
          Medi<span className="text-white">Connect</span>
        </span>

        {/* Tagline */}
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Join us &{" "}
            <span className="italic text-teal-400">get care.</span>
          </h1>
          <p className="text-slate-400 text-sm font-light leading-relaxed max-w-xs">
            Create your account and connect with the right doctor — quickly, simply, and securely.
          </p>
        </div>
      </div>

      {/* ── Right form section ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-teal-500 mb-2">
              Get started
            </p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Create your account
            </h2>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Role toggle — shown first so doctor fields appear naturally below */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase text-slate-500">
                I am a
              </label>
              <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-1 gap-1">
                {["PATIENT", "DOCTOR"].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r })}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                      formData.role === r
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {r === "PATIENT" ? "Patient" : "Doctor"}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase text-slate-500">Full Name</label>
              <input
                name="name"
                type="text"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase text-slate-500">Email Address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Phone + Language — side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-widest uppercase text-slate-500">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-widest uppercase text-slate-500">Language</label>
                <input
                  name="preferredLanguage"
                  type="text"
                  placeholder="en, hi…"
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase text-slate-500">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Doctor-only fields */}
            {formData.role === "DOCTOR" && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">Doctor Details</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-widest uppercase text-slate-500">Specialization</label>
                  <input
                    name="specialization"
                    type="text"
                    required
                    placeholder="e.g. General, Cardiologist"
                    value={formData.specialization}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-widest uppercase text-slate-500">Consultation Time</label>
                  <input
                    name="consultationTime"
                    type="text"
                    placeholder="e.g. 15 mins"
                    value={formData.consultationTime}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl bg-slate-900 hover:bg-slate-700 active:scale-[0.99] text-white text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* Login link */}
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-slate-900 font-semibold border-b-2 border-teal-400 pb-px hover:text-teal-600 transition-colors"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}