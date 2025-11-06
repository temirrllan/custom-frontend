// frontend/src/admin/AdminLayout.tsx
import { Outlet, Link } from "react-router-dom";
import "./admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <h3>Админ</h3>
        <nav>
          <Link to="/admin">Дашборд</Link>
          <Link to="/admin/costumes">Костюмы</Link>
          <Link to="/admin/bookings">Брони</Link>
          <Link to="/admin/logs">Логи</Link>
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
