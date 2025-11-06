// frontend/src/admin/LogsAdmin.tsx
import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";

export default function LogsAdmin() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(()=>{ adminApi.get("/api/admin/logs").then(r=>setLogs(r.data)); }, []);
  return (
    <div>
      <h2>Логи админов</h2>
      <div style={{display:'grid', gap:8}}>
        {logs.map(l=>(
          <div key={l._id} className="log-item">
            <div><strong>{l.action}</strong> — {new Date(l.createdAt).toLocaleString()}</div>
            <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(l.details,null,2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
