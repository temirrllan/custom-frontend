import axios from "axios";

// ✅ Базовый адрес API (универсальный для продакшена и локалки)
export const API_BASE =
  (import.meta.env.VITE_API_URL?.replace(/\/+$/, "")) ||
  "http://localhost:4000";

// ✅ Берём токен администратора из localStorage
function getAdminToken() {
  return localStorage.getItem("admin_token") || "";
}

// ✅ Создаём инстанс axios для админ-запросов
export const adminApi = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    "x-admin-token": getAdminToken(),
  },
});

// ✅ Обновляем токен (используется после логина)
export function setAdminToken(token: string) {
  localStorage.setItem("admin_token", token);
  adminApi.defaults.headers["x-admin-token"] = token;
}

// ✅ Вспомогательная функция: формирует полный URL к файлу
export function getFullUrl(path?: string): string {
  if (!path) return "https://via.placeholder.com/400x300?text=Нет+фото";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path.startsWith("/") ? path : "/" + path}`;
}

// ✅ Универсальная функция загрузки фото
// (до 5 файлов, 2 МБ каждый, только для админов)
export async function uploadPhotos(files: FileList) {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("photos", files[i]);
  }

  const res = await adminApi.post("/api/admin/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // { urls: [...] }
}
