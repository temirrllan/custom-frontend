import { useState } from "react";
import { useParams } from "react-router-dom";
import { createBooking } from "../api/api";
import WebApp from "@twa-dev/sdk"; // ✅ вот этот импорт обязателен

export default function BookingForm() {
  const { id } = useParams();

  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    size: "",
    childName: "",
    childAge: "",
    childHeight: ""
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
        ...form
      });
      setMessage("Заявка отправлена!");
    } catch (err) {
      console.error(err);
      setMessage("Ошибка при отправке 😔");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Бронирование</h2>
      {["clientName","phone","size","childName","childAge","childHeight"].map((f) => (
        <input
          key={f}
          name={f}
          placeholder={f}
          value={(form as any)[f]}
          onChange={handleChange}
          style={{ display: "block", marginBottom: 8, width: "100%" }}
        />
      ))}
      <button onClick={handleSubmit}>Отправить</button>
      {message && <p>{message}</p>}
    </div>
  );
}
