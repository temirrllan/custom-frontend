import { Routes, Route } from "react-router-dom";
import AdminLayout from "../admin/AdminLayout";
import Dashboard from "../admin/Dashboard";
import CostumesAdmin from "../admin/CostumesAdmin";
import BookingsAdmin from "../admin/BookingsAdmin";
import LogsAdmin from "../admin/LogsAdmin";
import CostumeEditor from "../admin/CostumeEditor";
import StockAdmin from "../admin/StockAdmin"; // 🆕

export default function AdminPanel() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="costumes" element={<CostumesAdmin />} />
        <Route path="costumes/:id" element={<CostumeEditor />} />
        <Route path="bookings" element={<BookingsAdmin />} />
        <Route path="stock" element={<StockAdmin />} /> {/* 🆕 */}
        <Route path="logs" element={<LogsAdmin />} />
      </Route>
    </Routes>
  );
}