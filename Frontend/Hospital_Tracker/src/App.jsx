import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import Chat from "./pages/Chat";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<Layout />}>
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/patient" element={<PatientDashboard />} />
              <Route path="/chat/:roomId" element={<Chat />} />
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
