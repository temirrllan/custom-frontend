import { useEffect, useState } from "react";
import { API_BASE, adminApi } from "../api/adminApi";
import { useNavigate, useParams } from "react-router-dom";
import "./admin.css";

export default function CostumeEditor() {
  const { id } = useParams();
  const nav = useNavigate();

  const [state, setState] = useState<any>({
    title: "",
    price: 0,
    sizes: [],
    stockBySize: {},
    heightRange: "",
    notes: "",
    photos: [],
    available: true,
    description: "",
  });

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🆕 Для добавления размеров
  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState(0);

  const toFullUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path}`;
  };

  useEffect(() => {
    if (!id || id === "new") return;
    setLoading(true);
    adminApi
      .get(`/api/admin/costumes`)
      .then((res: any) => {
        const found = res.data.find((c: any) => c._id === id);
        if (found) {
          const fullPhotos = found.photos?.map((p: string) => toFullUrl(p)) || [];
          setState({ ...found, photos: fullPhotos });
        } else {
          alert("Костюм не найден");
          nav("/costumes");
        }
      })
      .catch((err) => console.error("Ошибка загрузки костюма:", err))
      .finally(() => setLoading(false));
  }, [id, nav]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    setFiles(files);
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (!files || files.length === 0) return [];
    const form = new FormData();
    for (let i = 0; i < files.length; i++) form.append("photos", files[i]);
    const r = await adminApi.post("/api/admin/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return r.data.urls;
  };

  // 🆕 Добавить размер с количеством
  const addSize = () => {
    if (!newSize.trim()) return alert("Введите размер");
    if (state.sizes.includes(newSize.trim())) return alert("Этот размер уже добавлен");

    setState({
      ...state,
      sizes: [...state.sizes, newSize.trim()],
      stockBySize: { ...state.stockBySize, [newSize.trim()]: newStock },
    });

    setNewSize("");
    setNewStock(0);
  };

  // 🆕 Удалить размер
  const removeSize = (size: string) => {
    const newSizes = state.sizes.filter((s: string) => s !== size);
    const newStock = { ...state.stockBySize };
    delete newStock[size];
    setState({ ...state, sizes: newSizes, stockBySize: newStock });
  };

  // 🆕 Изменить количество для размера
  const updateStock = (size: string, value: number) => {
    setState({
      ...state,
      stockBySize: { ...state.stockBySize, [size]: Math.max(0, value) },
    });
  };

  const save = async () => {
    if (!state.title.trim()) return alert("Введите название костюма");
    if (state.price <= 0) return alert("Цена должна быть больше 0");
    if (state.sizes.length === 0) return alert("Добавьте хотя бы один размер");

    setSaving(true);
    try {
      const urls = await uploadFiles();
      const payload = { ...state, photos: [...(state.photos || []), ...urls] };

      if (id && id !== "new") {
        await adminApi.put(`/api/admin/costumes/${id}`, payload);
      } else {
        await adminApi.post(`/api/admin/costumes`, payload);
      }

      alert("✅ Костюм успешно сохранён!");
      nav("/costumes");
    } catch (err) {
      console.error("Ошибка при сохранении:", err);
      alert("Ошибка при сохранении костюма");
    } finally {
      setSaving(false);
    }
  };

  const removePhoto = (index: number) => {
    const updated = [...(state.photos || [])];
    updated.splice(index, 1);
    setState({ ...state, photos: updated });
  };

  if (loading) {
    return (
      <div className="admin-card">
        <div style={{ textAlign: "center", padding: "40px", color: "var(--tg-theme-hint-color, #8e8e93)" }}>
          Загрузка данных костюма...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <h2>{id === "new" ? "Новый костюм" : "Редактировать костюм"}</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Название */}
        <div>
          <label>Название *</label>
          <input
            placeholder="Введите название костюма"
            value={state.title}
            onChange={(e) => setState({ ...state, title: e.target.value })}
          />
        </div>

        {/* Цена */}
        <div>
          <label>Цена (₽) *</label>
          <input
            placeholder="0"
            type="number"
            value={state.price}
            onChange={(e) => setState({ ...state, price: Number(e.target.value) })}
            min="0"
            step="100"
          />
        </div>

        {/* 🆕 Размеры + количество */}
        <div>
          <label>Размеры и количество *</label>
          
          {/* Список уже добавленных размеров */}
          {state.sizes.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
              {state.sizes.map((size: string) => (
                <div
                  key={size}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    background: "var(--tg-theme-bg-color, #f2f2f7)",
                    borderRadius: "12px",
                  }}
                >
                  <span style={{ fontWeight: "600", minWidth: "60px" }}>{size}</span>
                  <input
                    type="number"
                    min="0"
                    value={state.stockBySize?.[size] || 0}
                    onChange={(e) => updateStock(size, Number(e.target.value))}
                    style={{ width: "80px", padding: "8px" }}
                  />
                  <span style={{ fontSize: "14px", color: "var(--tg-theme-hint-color, #8e8e93)" }}>шт.</span>
                  <button
                    type="button"
                    onClick={() => removeSize(size)}
                    className="danger"
                    style={{ marginLeft: "auto" }}
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Добавление нового размера */}
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <input
                placeholder="Размер (например, S или 152)"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSize()}
              />
            </div>
            <div style={{ width: "100px" }}>
              <input
                type="number"
                placeholder="Кол-во"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(Number(e.target.value))}
              />
            </div>
            <button type="button" onClick={addSize}>
              + Добавить
            </button>
          </div>
          <p className="hint">Размеры могут быть буквенными (S, M, L) или числовыми (92, 104, 152)</p>
        </div>

        {/* Рост */}
        <div>
          <label>Рост (например, 110–130 см)</label>
          <input
            placeholder="Введите диапазон роста"
            value={state.heightRange || ""}
            onChange={(e) => setState({ ...state, heightRange: e.target.value })}
          />
        </div>

        {/* Примечание */}
        <div>
          <label>Примечание</label>
          <textarea
            placeholder="Добавьте уточнение (например, «Есть шляпа в комплекте»)"
            value={state.notes || ""}
            onChange={(e) => setState({ ...state, notes: e.target.value })}
            rows={3}
          />
        </div>

        {/* Описание */}
        <div>
          <label>Описание</label>
          <textarea
            placeholder="Введите описание костюма"
            value={state.description}
            onChange={(e) => setState({ ...state, description: e.target.value })}
            rows={4}
          />
        </div>

        {/* Доступность */}
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              onClick={() => setState({ ...state, available: !state.available })}
              style={{
                width: 50,
                height: 26,
                background: state.available ? "#4cd964" : "#ccc",
                borderRadius: 20,
                position: "relative",
                cursor: "pointer",
                transition: "0.3s",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  background: "#fff",
                  borderRadius: "50%",
                  position: "absolute",
                  top: 2,
                  left: state.available ? 26 : 2,
                  transition: "0.3s",
                }}
              />
            </div>
            <span>{state.available ? "Доступен пользователям ✅" : "Недоступен ❌"}</span>
          </label>
        </div>

        {/* Фото */}
        <div>
          <label>Фотографии (до 5 шт.)</label>

          {state.photos?.length > 0 && (
            <div className="photo-grid">
              {state.photos.map((photo: string, index: number) => (
                <div key={index} className="photo-preview">
                  <img src={photo} alt={`Фото ${index + 1}`} />
                  <button className="danger" onClick={() => removePhoto(index)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {previewUrls.length > 0 && (
            <div className="photo-grid">
              {previewUrls.map((url, i) => (
                <div key={i} className="photo-preview new">
                  <img src={url} alt="new" />
                </div>
              ))}
            </div>
          )}

          <input type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
          <p className="hint">До 5 фото (JPG, PNG, WebP, ≤ 5 МБ каждое)</p>
        </div>

        {/* Кнопки */}
        <div className="actions">
          <button onClick={save} disabled={saving}>
            {saving ? "Сохранение..." : "💾 Сохранить"}
          </button>
          <button className="secondary" onClick={() => nav("/costumes")}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}