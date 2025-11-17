// src/api/authApi.js
import axiosClient from "./axiosClient";

const authApi = {
  signup: (data) => axiosClient.post("/signup", { user: data }),
  login: (data) => axiosClient.post("/login", data),
};

export default authApi;
