// src/api/authApi.js
import axiosClient from "./axiosClient";

const authApi = {
  signup: (data) => axiosClient.post("/signup", { user: data }),
  login: (data) => axiosClient.post("/login", { user: data }),
  fetchUser: () => axiosClient.get("/profile"), // optional
};

export default authApi;
