import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_URL = "http://localhost:8000";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", form.email);
      formData.append("password", form.password);

      const response = await axios.post(`${API_URL}/auth/login`, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("nickname", response.data.nickname);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      let errorMessage = err.response?.data?.detail || "Login failed";

      if (err.request) {
        errorMessage = "No response from server.";
      } else if (!err.response) {
        errorMessage = "An error occurred while sending the request.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
       <div className="text-center flex justify-center">
       <Link to="/"><img src="/img/logo.png" alt="" /></Link>
       </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
          Welcome Back!
        </h2>
      </div>
<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white p-6 shadow-md rounded-lg">

{error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
          aria-label="Email"
        />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
          type="password"
          name="password"
     
          value={form.password}
          onChange={handleChange}
           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
          aria-label="Password"
        />
        </div>
    
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 p-2 rounded text-white font-medium"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-500 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
    </div>
    
  );
};

export default LoginPage;
