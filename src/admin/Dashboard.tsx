// frontend/src/admin/Dashboard.tsx
import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";

export default function Dashboard() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    // пример запроса, можно добавить endpoints на backend для метрик
    adminApi.get("/admin/costumes").then(r => setStats({ costumes: r.data.length })).catch(()=>{});
  }, []);

  return (
    <div>
      <h2>Панель управления</h2>
      <p>Костюмов: {stats.costumes ?? "-"}</p>
    </div>
  );
}
