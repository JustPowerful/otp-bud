import { useAuthStore } from "@/stores/authStore";
import axios from "axios";

// read API URL from Vite environment variable, fallback for examples/tests
const API_URL = import.meta.env.VITE_API_URL || "https://api.example.com";

const api = axios.create({
  // baseURL configured via frontend/.env (VITE_API_URL)
  baseURL: API_URL,
  timeout: 10000, // 10 secondslll
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Optional: Add a request interceptor (e.g., for Auth Tokens)
api.interceptors.request.use(
  (config) => {
    // get the token from the auth store and add it to the headers if it exists
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
