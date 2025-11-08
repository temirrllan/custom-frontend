import { useEffect, useState } from "react";
import { getAdminCostumes, deleteCostume } from "../api/admin";
import AdminCostumeForm from "../components/AdminCostumeForm";
import AdminCostumeCard from "../components/AdminCostumeCard";
import Loader from "../components/Loader";

import "./AdminPanel.css";

export default function AdminPanel() {
  const [costumes, setCostumes] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await getAdminCostumes();
    setCostumes(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Удалить этот костюм?")) {
      await deleteCostume(id);
      await load();
    }
  };
if (loading) return <Loader text="Загрузка панели..." />;

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h2>Админ-панель</h2>
        <button onClick={() => setSelected({})}>＋ Добавить костюм</button>
      </header>

      {selected && (
        <AdminCostumeForm costume={selected} onClose={() => setSelected(null)} onSave={load} />
      )}

      <div className="admin-grid">
        {costumes.map((c) => (
          <AdminCostumeCard
            key={c._id}
            costume={c}
            onEdit={() => setSelected(c)}
            onDelete={() => handleDelete(c._id)}
          />
        ))}
      </div>
    </div>
  );
}
