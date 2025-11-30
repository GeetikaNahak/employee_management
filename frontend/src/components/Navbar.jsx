import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="w-full bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow">
      <h1 className="text-xl font-bold">Attendance System</h1>

      <div className="flex gap-4 items-center">
        {user?.role === "employee" && <Link to="/dashboard" className="hover:text-blue-200 transition-colors">Dashboard</Link>}
        {user?.role === "employee" && <Link to="/attendance" className="hover:text-blue-200 transition-colors">Attendance</Link>}
        {user?.role === "manager" && <Link to="/manager" className="hover:text-blue-200 transition-colors">Manager Panel</Link>}
        
        <Link to="/profile" className="hover:text-blue-200 transition-colors">Profile</Link>
        
        <button onClick={logout} className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 transition-colors">
          Logout
        </button>
      </div>
    </nav>
  );
}