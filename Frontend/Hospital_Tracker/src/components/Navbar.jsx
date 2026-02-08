import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Hospital Tracker</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700 dark:text-gray-300">
                            Welcome, {user.name} ({user.role})
                        </span>
                        {user.role === 'DOCTOR' && (
                            <Link to="/doctor" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                        )}
                        {user.role === 'PATIENT' && (
                            <Link to="/patient" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                        )}
                        <button
                            onClick={() => { logout(); navigate("/"); }}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
