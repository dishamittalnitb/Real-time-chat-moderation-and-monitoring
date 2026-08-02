import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios.js";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axiosInstance.post("/admin/login", {
        email,
        password,
      });

      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={login} className="p-6 shadow w-96">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-black text-white p-2 w-full"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;