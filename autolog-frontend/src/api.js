import axios from "axios";

const api = axios.create({
  baseURL: "https://autolog-backend-api.onrender.com/",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
