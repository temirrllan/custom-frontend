// frontend/src/api/adminApi.ts
import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getAdminToken() {
  return localStorage.getItem("admin_token") || "";
}

// 🔹 Создаём инстанс axios для запросов админ-панели
export const adminApi = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    "x-admin-token": getAdminToken(),
  },
});

// 🔹 Вспомогательная функция для установки токена при логине
export function setAdminToken(token: string) {
  localStorage.setItem("admin_token", token);
  adminApi.defaults.headers["x-admin-token"] = token;
}

// 🔹 Универсальная функция загрузки фото (до 5 изображений, 2 МБ каждое)
export async function uploadPhotos(files: FileList) {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("photos", files[i]);
  }

  const res = await adminApi.post("/api/admin/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
