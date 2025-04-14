import axios from "axios";

const API_URL = "http://localhost:8000";

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data;
};

export const login = async (credentials) => {
  const formData = new FormData();
  formData.append("username", credentials.email);
  formData.append("password", credentials.password);

  const response = await axios.post(`${API_URL}/auth/login`, formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (response.data?.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }
  return response.data;
};

export const getProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (err) {
    console.error("Profile fetch error:", err);
    return null; 
  }
};

export const logout = () => {
  localStorage.removeItem("token");
};
