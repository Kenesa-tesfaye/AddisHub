/**
 * api.js — Axios instance for CRH backend
 * Base URL: https://crh-backend-production.up.railway.app
 *
 * Interceptors:
 *   Request  → attaches JWT from localStorage as Bearer token
 *   Response → passes through; 401 auto-clears stored token
 */

import axios from "axios";

const api = axios.create({
  baseURL : import.meta.env.VITE_API_URL || "https://crh-backend-production.up.railway.app",
  timeout : 15000,
  headers : { "Content-Type": "application/json" },
});

/* ── Request: attach token ── */
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem("crh_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

/* ── Response: handle 401 ── */
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      /* Token expired — clear storage; Redux will be reset on next page load */
      localStorage.removeItem("crh_token");
      localStorage.removeItem("crh_user");
    }
    return Promise.reject(error);
  }
);

export default api;