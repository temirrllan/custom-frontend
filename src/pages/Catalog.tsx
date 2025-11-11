import { useEffect, useState } from "react";
import { getCostumes } from "../api/api";
import { useNavigate } from "react-router-dom";
import "./Catalog.css";
import { getFullUrl } from "../api/adminApi"; // ✅ теперь используем универсальную функцию
import Loader from "../components/Loader";

export default function Catalog() {
  const [costumes, setCostumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getCostumes()
      .then((data) => {
        // Фильтруем только доступные костюмы
        const available = data.filter((c: any) => c.available !== false);
        setCostumes(available);
      })
      .catch((err) => console.error("Ошибка загрузки каталога:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Загружаем костюмы..." />;

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
                  src={getFullUrl(c.photos?.[0])} // ✅ стабильный абсолютный путь
                  alt={c.title}
                  className="costume-img"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/400x300?text=Нет+фото";
                  }}
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
