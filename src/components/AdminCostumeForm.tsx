import { useState } from "react";
import { createCostume, updateCostume } from "../api/admin";
import "./AdminCostumeForm.css";

export default function AdminCostumeForm({ costume, onClose, onSave }: any) {
  const [form, setForm] = useState({
    title: costume.title || "",
    price: costume.price || "",
    sizes: (costume.sizes || []).join(", "),
    heightRange: costume.heightRange || "",
    notes: costume.notes || "",
    available: costume.available ?? true,
  });

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const data = {
      ...form,
sizes: form.sizes.split(",").map((s: string) => s.trim()),
      price: Number(form.price),
    };
    if (costume._id) await updateCostume(costume._id, data);
    else await createCostume(data);

    onSave();
    onClose();
  };

  return (
    <div className="admin-form-overlay">
      <div className="admin-form">
        <h3>{costume._id ? "Редактировать" : "Новый костюм"}</h3>

        {["title", "price", "sizes", "heightRange", "notes"].map((f) => (
          <input
            key={f}
            name={f}
            placeholder={f}
            value={(form as any)[f]}
            onChange={handleChange}
          />
        ))}

        <label>
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => setForm({ ...form, available: e.target.checked })}
          />
          Доступен для аренды
        </label>

        <div className="form-actions">
          <button onClick={handleSubmit}>💾 Сохранить</button>
          <button onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
}
