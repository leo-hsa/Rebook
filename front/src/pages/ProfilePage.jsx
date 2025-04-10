import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        
        const userResponse = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(userResponse.data);
        console.log("User data:", userResponse.data);  

        
        if (userResponse.data.role_id === 1) {
          try {
            const adminResponse = await axios.get(`${API_URL}/users/admin`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setAdminData(adminResponse.data);
            console.log("Admin data:", adminResponse.data);  
          } catch (adminErr) {
            console.warn("Failed to fetch admin data:", adminErr.response?.data || adminErr.message);
            setAdminData(null);  
          }
        }
      } catch (err) {
        console.error("Profile fetch error:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url  
        });
        const errorMessage = err.response?.data?.detail || "Failed to load profile";
        setError(errorMessage);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API_URL}/users/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      localStorage.removeItem("nickname");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to log out");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
          {userData.role_id === 1 ? "Admin Dashboard" : "Your Profile"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white p-6 shadow-md rounded-lg">
        <div className="space-y-4">
          <p><strong>ID:</strong> {userData.id}</p>
          <p><strong>Nickname:</strong> {userData.nickname}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Role:</strong> {userData.role_id === 1 ? "Admin" : "User"}</p>
        </div>

        {userData.role_id === 1 && adminData && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Admin Panel</h3>
            <p><strong>Users Count:</strong> {adminData.users_count}</p>
            <p>{adminData.message}</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full mt-6 bg-red-600 hover:bg-red-700 p-2 rounded text-white font-medium"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;