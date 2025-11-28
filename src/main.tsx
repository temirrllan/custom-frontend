import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import WebApp from "@twa-dev/sdk";
import "./index.css";
import "./App.css";
import "./styles/app.css";

// 🆕 КРИТИЧНО: Инициализация Telegram Web App
console.log("🚀 Инициализация Telegram Web App...");

WebApp.ready();
WebApp.expand();

// 🆕 Включаем вертикальные свайпы (если нужно)
WebApp.enableClosingConfirmation();

// 🆕 ВАЖНО: Проверяем доступность BackButton
if (WebApp.BackButton) {
  console.log("✅ BackButton доступен");
  WebApp.BackButton.hide(); // Изначально скрываем
} else {
  console.warn("⚠️ BackButton недоступен (возможно, старая версия Telegram)");
}

// Логируем информацию о пользователе
const initDataUnsafe = WebApp.initDataUnsafe;
const user = initDataUnsafe?.user;
console.log("👤 Telegram user:", user);
console.log("📱 Platform:", WebApp.platform);
console.log("🎨 Version:", WebApp.version);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);