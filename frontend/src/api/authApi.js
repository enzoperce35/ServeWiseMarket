import axiosClient from "./axiosClient";

export const signup = async (userData) => {
  const response = await axiosClient.post("/signup", { user: userData });
  return response.data; // contains user + token
};

export const login = async (credentials) => {
  const response = await axiosClient.post("/login", credentials);
  return response.data; // contains user + token
};

export const logout = async () => {
  const response = await axiosClient.delete("/logout");
  return response.data;
};
