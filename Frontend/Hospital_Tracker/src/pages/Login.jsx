import { useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("23btc193@ietdavv.edu.in");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.user);
      if (res.data.user.role === "DOCTOR") {
        navigate("/doctor");
      } else {
        navigate("/patient");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden md:flex md:w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full border border-teal-400/20" />
        <div className="absolute top-16 left-16 w-56 h-56 rounded-full border border-teal-400/10" />
        <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full border border-teal-400/20" />
        <div className="absolute -bottom-12 -right-12 w-72 h-72 rounded-full border border-teal-400/10" />

        <span className="relative z-10 text-2xl font-bold tracking-wide text-teal-400">
          Medi<span className="text-white">Connection</span>
        </span>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Care starts with{" "}
            <span className="italic text-teal-400">right choice.</span>
          </h1>
          <p className="text-slate-400 text-sm font-light leading-relaxed max-w-xs">
            Our duty to  connecting  patients and doctors in one seamless experience.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <div className="mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-teal-500 mb-2">
              Welcome back
            </p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Sign in to your account
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold tracking-widest uppercase text-slate-500"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm placeholder-slate-300 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold tracking-widest uppercase text-slate-500"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm placeholder-slate-300 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-2 bg-slate-900 hover:bg-slate-700 active:scale-[0.99] text-white text-sm font-medium tracking-wide rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="my-8 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* Register link */}
          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-slate-900 font-semibold border-b-2 border-teal-400 pb-px hover:text-teal-600 transition-colors"
            >
              Create one
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}