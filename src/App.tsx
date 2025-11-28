import WebApp from "@twa-dev/sdk";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Catalog from "./pages/Catalog";
import CostumeDetails from "./pages/CostumeDetails";
import BookingForm from "./pages/BookingForm";
import Orders from "./pages/Orders";
import AdminPanel from "./pages/AdminPanel";
import { getUserInfo } from "./api/api";
import Loader from "./components/Loader";

// 🆕 Компонент для управления BackButton
function BackButtonManager() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isMainPage = location.pathname === "/";
    
    console.log("🔄 Путь изменился:", location.pathname);
    console.log("🏠 Главная страница:", isMainPage);

    // Проверяем доступность BackButton
    if (!WebApp.BackButton) {
      console.warn("⚠️ BackButton недоступен в этой версии Telegram");
      return;
    }

    if (isMainPage) {
      console.log("👻 Скрываем кнопку назад");
      WebApp.BackButton.hide();
    } else {
      console.log("👁️ Показываем кнопку назад");
      WebApp.BackButton.show();

      const handleClick = () => {
        console.log("⬅️ Нажата кнопка назад");
        navigate(-1);
      };

      // Удаляем старые обработчики перед добавлением нового
      WebApp.BackButton.offClick(handleClick);
      WebApp.BackButton.onClick(handleClick);

      return () => {
        console.log("🧹 Очистка обработчика");
        WebApp.BackButton.offClick(handleClick);
      };
    }
  }, [location.pathname, navigate]);

  return null; // Этот компонент ничего не рендерит
}

function AppContent() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        WebApp.ready();
        WebApp.expand();

        // 🆕 Инициализируем BackButton
        if (WebApp.BackButton) {
          console.log("✅ BackButton доступен");
          WebApp.BackButton.hide(); // Начальное состояние
        } else {
          console.warn("⚠️ BackButton недоступен");
        }

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
    <>
      {/* 🆕 Менеджер кнопки "Назад" */}
      <BackButtonManager />
      
      {isAdmin ? (
        <AdminPanel />
      ) : (
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/costume/:id" element={<CostumeDetails />} />
          <Route path="/book/:id" element={<BookingForm />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}