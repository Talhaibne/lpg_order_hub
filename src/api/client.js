import axios from "axios";

// Configure your Laravel API base URL via env: VITE_API_BASE_URL
// Example: VITE_API_BASE_URL=https://api.example.com/api
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("blpg_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helpful flag — when no API base URL is configured we run in mock mode
export const USE_MOCK = !API_BASE_URL;
