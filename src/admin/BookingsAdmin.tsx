// frontend/src/admin/BookingsAdmin.tsx
import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";

export default function BookingsAdmin() {
  const [list, setList] = useState<any[]>([]);
  const load = () => adminApi.get("/api/admin/bookings").then(r=>setList(r.data));

  useEffect(()=>{ load(); }, []);

  const changeStatus = async (id: string, status: string) => {
    await adminApi.put(`/api/admin/bookings/${id}/status`, { status });
    load();
  };

  return (
    <div>
      <h2>Бронирования</h2>
      <div style={{display:'grid', gap:12}}>
        {list.map(b => (
          <div className="admin-item" key={b._id}>
            <div>
              <strong>{b.clientName}</strong> • {b.phone}
              <div>{b.costumeTitle} — {b.size}</div>
            </div>
            <div>
              <select value={b.status} onChange={(e)=>changeStatus(b._id, e.target.value)}>
                {["new","confirmed","cancelled","completed"].map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
