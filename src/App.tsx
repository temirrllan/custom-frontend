import WebApp from "@twa-dev/sdk";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Catalog from "./pages/Catalog";
import CostumeDetails from "./pages/CostumeDetails";
import BookingForm from "./pages/BookingForm";
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import CostumesAdmin from "./admin/CostumesAdmin";
import CostumeEditor from "./admin/CostumeEditor";
import BookingsAdmin from "./admin/BookingsAdmin";
import LogsAdmin from "./admin/LogsAdmin";
import { getUserInfo } from "./api/api"; // создадим, см. ниже
import AdminPanel from "./pages/AdminPanel.js";
import { useEffect, useState } from "react";
export default function App() {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
 useEffect(() => {
    const tgId = WebApp.initDataUnsafe?.user?.id;
    if (!tgId) return;

    getUserInfo(tgId).then((u) => setIsAdmin(u.isAdmin)).catch(() => setIsAdmin(false));
  }, []);

  if (isAdmin === null) return <p>Загрузка...</p>;
  return isAdmin ? <AdminPanel /> : <Catalog />;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/costume/:id" element={<CostumeDetails />} />
        <Route path="/book/:id" element={<BookingForm />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="costumes" element={<CostumesAdmin />} />
          <Route path="costumes/:id" element={<CostumeEditor />} />
          <Route path="costumes/new" element={<CostumeEditor />} />
          <Route path="bookings" element={<BookingsAdmin />} />
          <Route path="logs" element={<LogsAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
