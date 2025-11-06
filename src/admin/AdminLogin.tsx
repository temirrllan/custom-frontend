// frontend/src/admin/AdminLogin.tsx
import { useState } from "react";
import { setAdminToken } from "../api/adminApi";
import "./admin.css";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    setAdminToken(token);
    navigate("/admin");
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h2>Вход в админ-панель</h2>
        <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Введите admin token" />
        <button onClick={handleLogin}>Войти</button>
      </div>
    </div>
  );
}
