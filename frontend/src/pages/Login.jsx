import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import Particles from "react-tsparticles";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log(email);
    console.log(password);

    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_URL}/api/auth/login`, {
        email,
        password,
      });

      const data = response.data;

      if (!data.success) {
        setError(data.error || "Login failed");
      } else {
        localStorage.setItem("token", data.token);
        navigate("/admin-dashboard", { replace: true });
      }
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data?.error ||
            `HTTP error! status: ${err.response.status}`
        );
      } else if (err.request) {
        setError("No response from server. Please check if the server is running.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen relative overflow-hidden">
      {/* Background with Particles + Image */}
      <Particles
        className="absolute inset-0"
        options={{
          background: {
            image: "url('/images/bg-login.jpg')", // public/images/bg-login.jpg
            size: "cover",
            position: "center",
          },
          particles: {
            color: { value: ["#b4588bff", "#f472b6", "#f9a8d4"] },
            links: { enable: true, color: "#f472b6", opacity: 0.4 },
            move: { enable: true, speed: 1 },
            number: { value: 60, density: { enable: true, area: 800 } },
            opacity: { value: 0.6 },
            size: { value: { min: 2, max: 4 } },
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" },
              onClick: { enable: true, mode: "push" },
            },
            modes: {
              repulse: { distance: 100 },
              push: { quantity: 3 },
            },
          },
          detectRetina: true,
        }}
      />

      {/* Card */}
      <div className="relative bg-white shadow-xl rounded-2xl w-full max-w-md p-10 z-10">
        <div className="text-center mb-6">
          <div className="">
           EzRent Admin Dashboard
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-red-500 text-sm font-medium text-center">{error}</p>
          )}

          {/* Email Input */}
          <div className="flex items-center border rounded-lg px-4 py-3 bg-gray-50">
            <User className="text-gray-500 mr-3" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="flex-1 bg-transparent outline-none text-gray-700"
            />
          </div>

          {/* Password Input */}
          <div className="flex items-center border rounded-lg px-4 py-3 bg-gray-50">
            <Lock className="text-gray-500 mr-3" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="flex-1 bg-transparent outline-none text-gray-700"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end text-sm">
            <a href="#" className="text-pink-500 hover:underline">
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-pink-600 transition duration-300 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
