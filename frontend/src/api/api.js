import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "";
const normalizedBaseURL = baseURL.replace(/\/+$/, "");

// logs pra ver em produção
console.log("=== RUNNING API CONFIG ===");
console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
console.log("Axios baseURL =", `${normalizedBaseURL}/api`);

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
