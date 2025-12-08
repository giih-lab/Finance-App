import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

// tira / no final, se tiver, e adiciona /api
const normalizedBaseURL = baseURL.replace(/\/+$/, "");

export const api = axios.create({
  baseURL: `${normalizedBaseURL}/api`,
});

// interceptador de token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
