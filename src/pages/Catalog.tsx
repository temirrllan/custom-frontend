import { useEffect, useState } from "react";
import { getCostumes } from "../api/api";
import { useNavigate } from "react-router-dom";
import "./Catalog.css";

export default function Catalog() {
  const [costumes, setCostumes] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getCostumes()
      .then(setCostumes)
      .catch((err) => console.error("Ошибка загрузки каталога:", err));
  }, []);

  return (
    <div className="catalog-page">
      <header className="catalog-header">
        <h1 className="catalog-title">🎭 Прокат костюмов</h1>
        <p className="catalog-subtitle">Выберите костюм для бронирования</p>
      </header>

      {costumes.length === 0 ? (
        <p className="empty">Костюмы не найдены 😢</p>
      ) : (
        <div className="catalog-list">
          {costumes.map((c) => (
            <div
              key={c._id}
              className="costume-card"
              onClick={() => navigate(`/costume/${c._id}`)}
            >
              <div className="image-wrapper">
                <img
                  src={c.photos?.[0] || "https://via.placeholder.com/400x300?text=Нет+фото"}
                  alt={c.title}
                  className="costume-img"
                />
              </div>
              <div className="costume-info">
                <h3>{c.title}</h3>
                <p className="price">{c.price} ₽</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
