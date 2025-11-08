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
    photos: [],
    stockBySize: {},
    available: true,
    description: "",
  });

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🔗 Преобразует относительный путь в полный
  const toFullUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path}`;
  };

  // ✅ Загружаем текущие данные костюма
  useEffect(() => {
    if (!id || id === "new") return;
    setLoading(true);
    adminApi
      .get(`/api/admin/costumes`)
      .then((res: any) => {
        const found = res.data.find((c: any) => c._id === id);
        if (found) {
          // Если у костюма уже есть фото — подставляем с абсолютными ссылками
          const fullPhotos = found.photos?.map((p: string) => toFullUrl(p)) || [];
          setState({ ...found, photos: fullPhotos });
        } else {
          alert("Костюм не найден");
          nav("/admin/costumes");
        }
      })
      .catch((err) => console.error("Ошибка загрузки костюма:", err))
      .finally(() => setLoading(false));
  }, [id]);

  // ✅ Показываем превью сразу после выбора файлов
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    setFiles(files);
  };

  // ✅ Загрузка файлов на сервер
  const uploadFiles = async (): Promise<string[]> => {
    if (!files || files.length === 0) return [];
    const form = new FormData();
    for (let i = 0; i < files.length; i++) form.append("photos", files[i]);
    const r = await adminApi.post("/api/admin/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return r.data.urls;
  };

  // ✅ Сохранение (обновление или создание)
  const save = async () => {
    if (!state.title.trim()) return alert("Введите название костюма");
    if (state.price <= 0) return alert("Цена должна быть больше 0");

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
      nav("/admin/costumes");
    } catch (err) {
      console.error("Ошибка при сохранении:", err);
      alert("Ошибка при сохранении костюма");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Удаление фото
  const removePhoto = (index: number) => {
    const updated = [...(state.photos || [])];
    updated.splice(index, 1);
    setState({ ...state, photos: updated });
  };

  if (loading) {
    return (
      <div className="admin-card">
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "var(--tg-theme-hint-color, #8e8e93)",
          }}
        >
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
            onChange={(e) =>
              setState({ ...state, price: Number(e.target.value) })
            }
            min="0"
            step="100"
          />
        </div>

        {/* Описание */}
        <div>
          <label>Описание</label>
          <textarea
            placeholder="Введите описание костюма"
            value={state.description}
            onChange={(e) =>
              setState({ ...state, description: e.target.value })
            }
            rows={4}
          />
        </div>

        {/* Флаг доступности */}
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              onClick={() =>
                setState({ ...state, available: !state.available })
              }
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
            <span>
              {state.available
                ? "Доступен пользователям ✅"
                : "Недоступен ❌"}
            </span>
          </label>
        </div>

        {/* Фото */}
        <div>
          <label>Фотографии (до 5 шт.)</label>

          {/* Существующие фото */}
          {state.photos?.length > 0 && (
            <div className="photo-grid">
              {state.photos.map((photo: string, index: number) => (
                <div key={index} className="photo-preview">
                  <img src={photo} alt={`Фото ${index + 1}`} />
                  <button
                    className="danger"
                    onClick={() => removePhoto(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Новые фото (предпросмотр) */}
          {previewUrls.length > 0 && (
            <div className="photo-grid">
              {previewUrls.map((url, i) => (
                <div key={i} className="photo-preview new">
                  <img src={url} alt="new" />
                </div>
              ))}
            </div>
          )}

          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
          />
          <p className="hint">До 5 фото (JPG, PNG, WebP, ≤ 2 МБ каждое)</p>
        </div>

        {/* Кнопки */}
        <div className="actions">
          <button onClick={save} disabled={saving}>
            {saving ? "Сохранение..." : "💾 Сохранить"}
          </button>
          <button className="secondary" onClick={() => nav("/admin/costumes")}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
