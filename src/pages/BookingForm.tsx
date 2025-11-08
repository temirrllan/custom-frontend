import { useState } from "react";
import { useParams } from "react-router-dom";
import { createBooking } from "../api/api";
import WebApp from "@twa-dev/sdk";
import Loader from "../components/Loader"; // ✅ добавили компонент загрузки
import "./BookingForm.css";

export default function BookingForm() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    size: "",
    childName: "",
    childAge: "",
    childHeight: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (loading) return; // защита от повторного нажатия

    // простая валидация
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

      // закрываем форму через 1 секунду
      setTimeout(() => {
        WebApp.close();
      }, 1000);
    } catch (err) {
      console.error(err);
      WebApp.showAlert("❌ Ошибка при отправке. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Отправляем заявку..." />; // ✅ лоадер на весь экран

  return (
    <div className="booking-wrapper">
      <h2 className="booking-title">Бронирование костюма</h2>

      <div className="booking-form">
        {[
          { name: "clientName", label: "Ваше имя" },
          { name: "phone", label: "Телефон" },
          { name: "size", label: "Размер" },
          { name: "childName", label: "Имя ребёнка" },
          { name: "childAge", label: "Возраст ребёнка" },
          { name: "childHeight", label: "Рост ребёнка (см)" },
        ].map((field) => (
          <div key={field.name} className="input-group">
            <input
              name={field.name}
              placeholder=" "
              value={(form as any)[field.name]}
              onChange={handleChange}
              required
            />
            <label>{field.label}</label>
          </div>
        ))}

        <button className="submit-btn" onClick={handleSubmit}>
          Отправить заявку
        </button>

        {success && <p className="form-message success">✅ Заявка отправлена!</p>}
      </div>
    </div>
  );
}
