import { useState } from "react";
import { useParams } from "react-router-dom";
import { createBooking } from "../api/api";
import WebApp from "@twa-dev/sdk";
import "./BookingForm.css"; // ✅ добавляем стили

export default function BookingForm() {
  const { id } = useParams();

  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    size: "",
    childName: "",
    childAge: "",
    childHeight: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await createBooking({
        userTgId: WebApp.initDataUnsafe?.user?.id || 0,
        costumeId: id,
        ...form,
      });
      setMessage("✅ Заявка успешно отправлена!");
      setForm({
        clientName: "",
        phone: "",
        size: "",
        childName: "",
        childAge: "",
        childHeight: "",
      });
    } catch (err) {
      console.error(err);
      setMessage("❌ Ошибка при отправке. Попробуйте снова.");
    }
  };

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

        {message && <p className="form-message">{message}</p>}
      </div>
    </div>
  );
}
