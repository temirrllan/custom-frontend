import { useState, useEffect } from "react";
import { createCostume, updateCostume, uploadPhotos } from "../api/admin";
import "./AdminCostumeForm.css";

interface CostumeFormProps {
  costume?: any;
  onClose: () => void;
  onSave: () => void;
}

export default function AdminCostumeForm({ costume, onClose, onSave }: CostumeFormProps) {
  const [form, setForm] = useState({
    title: "",
    price: "",
    sizes: "",
    stockBySize: "",
    heightRange: "",
    notes: "",
    available: true,
    photos: [] as string[],
  });

  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (costume) {
      setForm({
        title: costume.title || "",
        price: costume.price || "",
        sizes: costume.sizes?.join(", ") || "",
        stockBySize: costume.stockBySize || "",
        heightRange: costume.heightRange || "",
        notes: costume.notes || "",
        available: costume.available ?? true,
        photos: costume.photos || [],
      });
      setPreviews(costume.photos || []);
    }
  }, [costume]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // ✅ Обработка загрузки фото
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (files.length + form.photos.length > 5) {
      setError("Максимум 5 фото");
      return;
    }

    const validFiles = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );

    const tooBig = validFiles.find((f) => f.size > 2 * 1024 * 1024);
    if (tooBig) {
      setError("Размер файла не должен превышать 2 МБ");
      return;
    }

    setUploading(true);
    try {
      const res = await uploadPhotos(validFiles);
      const urls = res.urls;
      setForm((prev) => ({ ...prev, photos: [...prev.photos, ...urls] }));
      setPreviews((prev) => [...prev, ...urls]);
    } catch (err) {
      setError("Ошибка загрузки фото");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    const payload = {
      ...form,
      sizes: form.sizes.split(",").map((s) => s.trim()),
    };
    if (costume?._id) await updateCostume(costume._id, payload);
    else await createCostume(payload);
    onSave();
    onClose();
  };

  const handleRemovePhoto = (url: string) => {
    setPreviews((prev) => prev.filter((p) => p !== url));
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p !== url),
    }));
  };

  return (
    <div className="admin-form-overlay">
      <div className="admin-form">
        <h3>{costume?._id ? "Редактировать костюм" : "Добавить костюм"}</h3>

        <input name="title" placeholder="Название" value={form.title} onChange={handleChange} />
        <input name="price" placeholder="Цена" value={form.price} onChange={handleChange} />
        <input name="sizes" placeholder="Размеры (через запятую)" value={form.sizes} onChange={handleChange} />
        <input name="stockBySize" placeholder="Количество" value={form.stockBySize} onChange={handleChange} />
        <input name="heightRange" placeholder="Рост (см)" value={form.heightRange} onChange={handleChange} />

        <textarea
          name="notes"
          placeholder="Примечание"
          value={form.notes}
          onChange={handleChange}
        />

        <label className="checkbox">
          <input type="checkbox" name="available" checked={form.available} onChange={handleChange} />
          Доступен пользователям
        </label>

        <div className="photo-upload">
          <label className="upload-label">
            📸 Загрузить фото (до 5)
            <input type="file" multiple accept="image/*" onChange={handleFileChange} />
          </label>
          {uploading && <p className="uploading">Загрузка...</p>}

          <div className="photo-preview">
            {previews.map((url) => (
              <div key={url} className="preview-item">
                <img src={url} alt="preview" />
                <button onClick={() => handleRemovePhoto(url)}>✖</button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="buttons">
          <button className="save-btn" onClick={handleSubmit}>
            💾 Сохранить
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
