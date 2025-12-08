import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;
const normalizedBaseURL = baseURL.replace(/\/+$/, "");

export const api = axios.create({
  baseURL: `${normalizedBaseURL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
