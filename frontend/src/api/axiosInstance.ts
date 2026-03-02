import axios from "axios";

// read API URL from Vite environment variable, fallback for examples/tests
const API_URL = import.meta.env.VITE_API_URL || "https://api.example.com";

const api = axios.create({
  // baseURL configured via frontend/.env (VITE_API_URL)
  baseURL: API_URL,
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add a request interceptor for Auth Tokens
// Using a lazy-loaded getter to avoid circular dependency with authStore
api.interceptors.request.use((config) => {
  // Lazy load authStore only when needed
  const authStore = (globalThis as any).__auth_store__ || null;
  if (authStore?.token) {
    console.log("Attaching token to request:", authStore.token);
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// Export a function to set the auth store reference
export function setAuthStore(store: any) {
  (globalThis as any).__auth_store__ = store;
}

export default api;
