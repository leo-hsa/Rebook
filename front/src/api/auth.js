import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const register = async(userData) =>{
    return axios.post(`${API_URL}/auth/register`, userData);

};


export const login = async(credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if(response.data.access_token){
        localStorage.setItem("token", response.data.access_token);
    }
    return response.data;
};

export const getProfile = async() => {
    return axios.get(`${API_URL}/users/me`,{
        headers:{
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
    });
};

export const logout = () => {
    localStorage.removeItem("token");
}