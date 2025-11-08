import { useEffect, useState } from "react";
import { createCostume, updateCostume, uploadPhotos, API_BASE } from "../api/admin";
import "./AdminCostumeForm.css";

interface Props {
  costume?: any;
  onClose: () => void;
  onSave: () => void;
}

export default function AdminCostumeForm({ costume, onClose, onSave }: Props) {
  const [form, setForm] = useState<any>({
    title: "",
    price: "",
    sizes: "",
    stockBySize: {},
    heightRange: "",
    notes: "",
    available: true,
    photos: [] as string[], // серверные URL (полные)
  });

  // previews — отображаемые картинки (blob: или полные http(s) ссылки)
  const [previews, setPreviews] = useState<string[]>([]);
  // localFiles — файлы, которые ещё не были загружены (соответствуют началу previews)
  const [, setLocalFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (costume) {
      setForm({
        title: costume.title || "",
        price: costume.price || "",
        sizes: (costume.sizes || []).join(", "),
        stockBySize: costume.stockBySize || {},
        heightRange: costume.heightRange || "",
        notes: costume.notes || "",
        available: costume.available ?? true,
        photos: (costume.photos || []).map((p: string) => toFullUrl(p)),
      });
      // previews и photos инициализируем из серверных ссылок
      setPreviews((costume.photos || []).map((p: string) => toFullUrl(p)));
    }
    // cleanup: revoke any lingering blobs when unmount
    return () => {
      previews.forEach((p) => {
        if (p.startsWith("blob:")) URL.revokeObjectURL(p);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [costume]);

  function toFullUrl(path: string) {
    if (!path) return path;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    // path may be "/uploads/xxx.jpg"
    return `${API_BASE}${path}`;
  }

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((s: any) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  // выбор файлов
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const files = e.target.files;
    if (!files) return;

    const selected = Array.from(files);
    if (selected.length + previews.length > 5) {
      setError("Максимум 5 фото");
      return;
    }

    // фильтрация по типу
    const valid = selected.filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    if (valid.length !== selected.length) {
      setError("Разрешены только JPG, PNG и WebP");
      return;
    }

    const tooBig = valid.find((f) => f.size > 2 * 1024 * 1024);
    if (tooBig) {
      setError("Один из файлов больше 2 МБ");
      return;
    }

    // 1) создаём локальные превью и добавляем в previews
    const localPreviews = valid.map((f) => URL.createObjectURL(f));
    setPreviews((p) => [...p, ...localPreviews]);
    setLocalFiles((lf) => [...lf, ...valid]);

    // 2) грузим файлы на сервер — загружаем только те, которые ещё не загружены
    setUploading(true);
    try {
      const res = await uploadPhotos(valid); // вернёт относительные ссылки ['/uploads/..']
      const serverUrls: string[] = (res.urls || []).map((u: string) => toFullUrl(u));

      // Заменяем первые localPreviews в previews на serverUrls по порядку
      setPreviews((current) => {
        const newPreviews = [...current];
        // Найдём индексы локальных превью (те, что начинаются с blob:)
        let serverIdx = 0;
        for (let i = 0; i < newPreviews.length && serverIdx < serverUrls.length; i++) {
          if (newPreviews[i].startsWith("blob:")) {
            // revoke old blob url
            URL.revokeObjectURL(newPreviews[i]);
            newPreviews[i] = serverUrls[serverIdx++];
          }
        }
        return newPreviews;
      });

      // Добавляем serverUrls в form.photos
      setForm((prev: any) => ({ ...prev, photos: [...prev.photos, ...serverUrls] }));

      // Так как эти файлы уже загружены, убираем их из localFiles
      setLocalFiles((lf) => {
        // удаляем первые valid.length файлов
        const newLf = [...lf];
        newLf.splice(0, valid.length);
        return newLf;
      });
    } catch (err) {
      console.error("uploadPhotos err", err);
      setError("Ошибка загрузки на сервер");
      // при ошибке — нужно убрать созданные blob previews и localFiles, либо оставить их для повторной загрузки
    } finally {
      setUploading(false);
      // сброс input value, чтобы можно было выбрать те же файлы снова
      e.currentTarget.value = "";
    }
  };

  const handleRemovePreview = (index: number) => {
    const pv = previews[index];
    // Если это blob (локальный), revoke objectURL и удалить из localFiles
    if (pv && pv.startsWith("blob:")) {
      URL.revokeObjectURL(pv);
      // удаляем первый элемент из localFiles соответствующий этому локальному preview
      setLocalFiles((lf) => {
        const newLf = [...lf];
        // здесь трудно точно сопоставить file с preview, но мы добавляем соответствие по порядку
        // удаляем самый ранний файл (FIFO) — это корректно при последовательном добавлении
        newLf.splice(0, 1);
        return newLf;
      });
    } else {
      // это серверный URL — удалить из form.photos
      setForm((prev: any) => ({ ...prev, photos: prev.photos.filter((p: string) => p !== pv) }));
    }

    setPreviews((p) => p.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    const payload = {
      title: form.title,
      price: Number(form.price) || 0,
      sizes: (form.sizes || "").split(",").map((s: string) => s.trim()).filter(Boolean),
      stockBySize: form.stockBySize || {},
      heightRange: form.heightRange || "",
      notes: form.notes || "",
      available: !!form.available,
      photos: form.photos || [], // уже полные ссылки
    };

    try {
      if (costume && costume._id) {
        await updateCostume(costume._id, payload);
      } else {
        await createCostume(payload);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error("save costume error", err);
      setError("Ошибка при сохранении");
    }
  };

  return (
    <div className="admin-form-overlay">
      <div className="admin-form">
        <h3>{costume?._id ? "Редактировать костюм" : "Добавить костюм"}</h3>

        <input name="title" placeholder="Название" value={form.title} onChange={handleChange} />
        <input name="price" placeholder="Цена" value={form.price} onChange={handleChange} />
        <input name="sizes" placeholder="Размеры (через запятую)" value={form.sizes} onChange={handleChange} />
        <input name="heightRange" placeholder="Рост (см)" value={form.heightRange} onChange={handleChange} />
        <textarea name="notes" placeholder="Примечание" value={form.notes} onChange={handleChange} />

        <div className="toggle-wrapper">
          <span>Доступен пользователям</span>
          <label className="toggle">
            <input type="checkbox" name="available" checked={form.available} onChange={handleChange} />
            <span className="slider" />
          </label>
        </div>

        <div className="photo-upload">
          <label className="upload-label">
            📸 Загрузить фото (до 5)
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
          </label>
          {uploading && <p className="uploading">Загрузка...</p>}

          <div className="photo-preview">
            {previews.map((p, i) => (
              <div className="preview-item" key={p + i}>
                <img src={p} alt={`preview-${i}`} />
                <button type="button" onClick={() => handleRemovePreview(i)}>✖</button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="buttons">
          <button className="save-btn" onClick={handleSubmit}>💾 Сохранить</button>
          <button className="cancel-btn" onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
}
