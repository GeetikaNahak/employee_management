import { useContext, useState } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", form);
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gray-100">
      <form className="w-80 p-6 bg-white shadow rounded" onSubmit={handleSubmit}>
        <h2 className="text-2xl mb-4 font-bold text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="input"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="input mt-3"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
