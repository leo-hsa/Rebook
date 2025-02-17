import axios from "axios";

const API_URL = "http://localhost:8000";

export const register = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
};

export const login = async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
        username: credentials.email, // Исправлено
        password: credentials.password,
    });

    if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
    }
    return response.data;
};

export const getProfile = async () => {
    return axios.get(`${API_URL}/auth/me`, {  // Исправлен путь
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};

export const logout = () => {
    localStorage.removeItem("token");
};
