import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // set true if using cookies/session
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // must match login storage key
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
