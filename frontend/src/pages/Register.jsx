import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role: "employee",
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      alert("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    try {
      await axios.post("/auth/register", form);
      alert("Registration successful! You can now login.");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gray-100">
      <form className="w-80 p-6 bg-white shadow rounded" onSubmit={submit}>
        <h2 className="text-2xl mb-4 font-bold text-center">Register</h2>

        <input
          type="text"
          placeholder="Name"
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="input mt-3"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="input mt-3"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength="6"
        />

        <input
          type="text"
          placeholder="Department (Optional)"
          className="input mt-3"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />

        <select
          className="input mt-3"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
        </select>

        <button 
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
