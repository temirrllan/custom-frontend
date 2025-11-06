// frontend/src/api/adminApi.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getAdminToken() {
  return localStorage.getItem("admin_token") || "";
}

export const adminApi = axios.create({
  baseURL: API_BASE,
  headers: {
    "x-admin-token": getAdminToken()
  }
});

// helper to set token
export function setAdminToken(token: string) {
  localStorage.setItem("admin_token", token);
  adminApi.defaults.headers["x-admin-token"] = token;
}
