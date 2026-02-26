import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <div className="min-h-screen bg-sky-100 transition-colors duration-200">
            <Navbar />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-slate-200 shadow-sm p-6">
                   <Outlet />
                </div>
            </main>
        </div>
    );
}