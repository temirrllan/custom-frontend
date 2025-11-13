import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { createBooking, getCostumes } from "../api/api";
import WebApp from "@twa-dev/sdk";
import Loader from "../components/Loader";
import "./BookingForm.css";

export default function BookingForm() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [costume, setCostume] = useState<any>(null);
  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    size: "",
    childName: "",
    childAge: "",
    childHeight: "",
  });

  // 🆕 Загружаем данные костюма, чтобы узнать доступные размеры
  useEffect(() => {
    getCostumes().then((all) => {
      const found = all.find((c: any) => c._id === id);
      setCostume(found);
    });
  }, [id]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!form.clientName || !form.phone || !form.size) {
      WebApp.showAlert("⚠️ Заполните обязательные поля!");
      return;
    }

    try {
      setLoading(true);

      await createBooking({
        userTgId: WebApp.initDataUnsafe?.user?.id || 0,
        costumeId: id,
        ...form,
      });

      setSuccess(true);
      WebApp.showAlert("✅ Заявка успешно отправлена!");

      setTimeout(() => {
        WebApp.close();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Ошибка при отправке. Попробуйте снова.";
      WebApp.showAlert(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Отправляем заявку..." />;
  if (!costume) return <Loader text="Загрузка данных..." />;

  // 🆕 Фильтруем только доступные размеры
  const stockBySize = costume.stockBySize || {};
  const availableSizes = costume.sizes?.filter((size: string) => (stockBySize[size] || 0) > 0) || [];

  return (
    <div className="booking-wrapper">
      <h2 className="booking-title">Бронирование костюма</h2>

      <div className="booking-form">
        {/* Имя клиента */}
        <div className="input-group">
          <input name="clientName" placeholder=" " value={form.clientName} onChange={handleChange} required />
          <label>Ваше имя *</label>
        </div>

        {/* Телефон */}
        <div className="input-group">
          <input name="phone" placeholder=" " value={form.phone} onChange={handleChange} required />
          <label>Телефон *</label>
        </div>

        {/* 🆕 Размер (только доступные) */}
        <div className="input-group">
          <select
            name="size"
            value={form.size}
            onChange={handleChange}
            required
            style={{
              padding: "16px 14px",
              fontSize: "16px",
              borderRadius: "14px",
              border: "2px solid transparent",
              background: "var(--tg-theme-bg-color, #f2f2f7)",
              color: "var(--tg-theme-text-color, #1c1c1e)",
              width: "100%",
            }}
          >
            <option value="">Выберите размер *</option>
            {availableSizes.map((size: string) => (
              <option key={size} value={size}>
                {size} (в наличии: {stockBySize[size]} шт.)
              </option>
            ))}
          </select>
        </div>

        {availableSizes.length === 0 && (
          <p style={{ color: "#ff3b30", fontSize: "14px", textAlign: "center" }}>
            ❌ Все размеры закончились
          </p>
        )}

        {/* Имя ребёнка */}
        <div className="input-group">
          <input name="childName" placeholder=" " value={form.childName} onChange={handleChange} />
          <label>Имя ребёнка</label>
        </div>

        {/* Возраст */}
        <div className="input-group">
          <input name="childAge" placeholder=" " value={form.childAge} onChange={handleChange} />
          <label>Возраст ребёнка</label>
        </div>

        {/* Рост */}
        <div className="input-group">
          <input name="childHeight" placeholder=" " value={form.childHeight} onChange={handleChange} />
          <label>Рост ребёнка (см)</label>
        </div>

        <button className="submit-btn" onClick={handleSubmit} disabled={availableSizes.length === 0}>
          Отправить заявку
        </button>

        {success && <p className="form-message success">✅ Заявка отправлена!</p>}
      </div>
    </div>
  );
}