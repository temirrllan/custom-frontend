// frontend/src/admin/CostumesAdmin.tsx
import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useNavigate } from "react-router-dom";

export default function CostumesAdmin() {
  const [list, setList] = useState<any[]>([]);
  const nav = useNavigate();

  const load = () => adminApi.get("/api/admin/costumes").then(r => setList(r.data));

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Удалить костюм?")) return;
    await adminApi.delete(`/api/admin/costumes/${id}`);
    load();
  };

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>Костюмы</h2>
        <button onClick={()=>nav("/admin/costumes/new")}>Добавить</button>
      </div>

      <div style={{display:'grid', gap:12}}>
        {list.map(c => (
          <div key={c._id} className="admin-item">
            <div>
              <strong>{c.title}</strong><div>{c.price} ₽</div>
            </div>
            <div>
              <button onClick={()=>nav(`/admin/costumes/${c._id}`)}>Ред.</button>
              <button onClick={()=>remove(c._id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
