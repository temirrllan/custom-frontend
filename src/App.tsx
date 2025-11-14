import WebApp from "@twa-dev/sdk";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Catalog from "./pages/Catalog";
import CostumeDetails from "./pages/CostumeDetails";
import BookingForm from "./pages/BookingForm";
import Orders from "./pages/Orders"; // 🆕
import { getUserInfo } from "./api/api";
import AdminPanel from "./pages/AdminPanel";
import { useEffect, useState } from "react";
import Loader from "./components/Loader";

export default function App() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
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

  if (loading) {
    return <Loader text="Загрузка приложения..." />;
  }

  return (
    <BrowserRouter>
      {isAdmin ? (
        <AdminPanel />
      ) : (
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/costume/:id" element={<CostumeDetails />} />
          <Route path="/book/:id" element={<BookingForm />} />
          <Route path="/orders" element={<Orders />} /> {/* 🆕 */}
        </Routes>
      )}
    </BrowserRouter>
  );
}