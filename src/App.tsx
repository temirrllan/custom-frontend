import WebApp from "@twa-dev/sdk";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

// --- Страницы пользователя ---
import Catalog from "./pages/Catalog";
import CostumeDetails from "./pages/CostumeDetails";
import BookingForm from "./pages/BookingForm";

// --- Админ-панель ---
import AdminPanel from "./pages/AdminPanel";

// --- Другие (если будут нужны) ---
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import CostumesAdmin from "./admin/CostumesAdmin";
import CostumeEditor from "./admin/CostumeEditor";
import BookingsAdmin from "./admin/BookingsAdmin";
import LogsAdmin from "./admin/LogsAdmin";

// --- API ---
import { getUserInfo } from "./api/api";

export default function App() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        // Telegram WebApp SDK инициализация
        WebApp.ready();
        WebApp.expand();

        const tgId = WebApp.initDataUnsafe?.user?.id;
        if (!tgId) {
          console.warn("❗ Не удалось получить Telegram ID");
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const user = await getUserInfo(tgId);
        setIsAdmin(user.isAdmin);
      } catch (err) {
        console.error("Ошибка при получении данных пользователя:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  if (loading) return <p style={{ textAlign: "center", marginTop: 50 }}>Загрузка...</p>;

  return (
    <BrowserRouter>
      {isAdmin ? (
        // 🔹 Если админ — показываем админ-панель
        <AdminPanel />
      ) : (
        // 🔹 Если обычный пользователь — каталог + страницы брони
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/costume/:id" element={<CostumeDetails />} />
          <Route path="/book/:id" element={<BookingForm />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
