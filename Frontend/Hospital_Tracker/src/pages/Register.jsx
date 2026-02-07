import { useState } from "react";
import api from "../api/api";

export default function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PATIENT");

  const handleRegister = async () => {
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role
      });

      alert("Registration successful. Please login.");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>

      <h2>Register</h2>

      <input
        placeholder="Name"
        onChange={e => setName(e.target.value)}
      />

      <input
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />

      <select onChange={e => setRole(e.target.value)}>
        <option value="PATIENT">Patient</option>
        <option value="DOCTOR">Doctor</option>
      </select>

      <button onClick={handleRegister}>
        Register
      </button>

    </div>
  );
}
