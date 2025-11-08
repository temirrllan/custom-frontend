// frontend/src/admin/CostumeEditor.tsx
import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useNavigate, useParams } from "react-router-dom";
import "./admin.css";

export default function CostumeEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const [state, setState] = useState<any>({
    title: "", price: 0, sizes: [], photos: [], stockBySize: {}, available: true, description: ""
  });
  const [files, setFiles] = useState<FileList|null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && id !== "new") {
      setLoading(true);
      adminApi.get(`/api/admin/costumes`).then(r => {
        const found = r.data.find((x:any)=>x._id===id);
        if (found) setState(found);
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const uploadFiles = async (): Promise<string[]> => {
    if (!files || files.length===0) return [];
    const form = new FormData();
    for (let i=0;i<files.length;i++) form.append("photos", files[i]);
    const r = await adminApi.post("/api/admin/upload", form, { headers: { "Content-Type": "multipart/form-data" }});
    return r.data.urls;
  };

  const save = async () => {
    if (!state.title.trim()) {
      alert("Введите название костюма");
      return;
    }
    if (state.price <= 0) {
      alert("Цена должна быть больше 0");
      return;
    }

    setSaving(true);
    try {
      const urls = await uploadFiles();
      const payload = { ...state, photos: [...(state.photos||[]), ...urls] };
      if (id && id !== "new") {
        await adminApi.put(`/api/admin/costumes/${id}`, payload);
      } else {
        await adminApi.post(`/api/admin/costumes`, payload);
      }
      nav("/admin/costumes");
    } catch (error) {
      alert("Ошибка при сохранении");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...(state.photos || [])];
    newPhotos.splice(index, 1);
    setState({ ...state, photos: newPhotos });
  };

  if (loading) {
    return (
      <div className="admin-card">
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--tg-theme-hint-color, #8e8e93)' }}>
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <h2>{id==="new" ? "Новый костюм" : "Редактировать костюм"}</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--tg-theme-text-color, #1c1c1e)' }}>
            Название *
          </label>
          <input 
            placeholder="Введите название костюма" 
            value={state.title} 
            onChange={e=>setState({...state, title:e.target.value})}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--tg-theme-text-color, #1c1c1e)' }}>
            Цена (₽) *
          </label>
          <input 
            placeholder="0" 
            type="number" 
            value={state.price} 
            onChange={e=>setState({...state, price:Number(e.target.value)})}
            min="0"
            step="100"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--tg-theme-text-color, #1c1c1e)' }}>
            Описание
          </label>
          <textarea 
            placeholder="Введите описание костюма" 
            value={state.description} 
            onChange={e=>setState({...state, description:e.target.value})}
            rows={4}
          />
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={state.available} 
              onChange={e=>setState({...state, available:e.target.checked})}
              style={{ width: 'auto', cursor: 'pointer' }}
            />
            <span style={{ fontWeight: '600', color: 'var(--tg-theme-text-color, #1c1c1e)' }}>
              Доступен для бронирования
            </span>
          </label>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--tg-theme-text-color, #1c1c1e)' }}>
            Фотографии
          </label>
          
          {state.photos && state.photos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              {state.photos.map((photo: string, index: number) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img 
                    src={photo} 
                    alt={`Фото ${index + 1}`}
                    style={{ 
                      width: '100%', 
                      height: '100px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      border: '2px solid rgba(0,0,0,0.08)'
                    }}
                  />
                  <button
                    className="danger"
                    onClick={() => removePhoto(index)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      minWidth: 'auto'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={e=>setFiles(e.target.files)} 
            style={{ 
              padding: '10px',
              border: '2px dashed rgba(0,0,0,0.1)',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          />
          <div style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color, #8e8e93)', marginTop: '4px' }}>
            Можно выбрать несколько файлов
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button 
            onClick={save} 
            disabled={saving}
            style={{ flex: 1 }}
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
          <button 
            className="secondary"
            onClick={()=>nav("/admin/costumes")}
            disabled={saving}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
