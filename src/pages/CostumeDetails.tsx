import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCostumes } from "../api/api";
import "./CostumeDetails.css";

export default function CostumeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [costume, setCostume] = useState<any>(null);

  useEffect(() => {
    getCostumes().then((all) => {
      setCostume(all.find((c: any) => c._id === id));
    });
  }, [id]);

  if (!costume)
    return <p className="loading-text">Загрузка костюма...</p>;

  return (
    <div className="page-container">
      <header className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className="page-title">{costume.title}</h1>
      </header>

      <div className="card">
        <img
          src={
            costume.photos?.[0] ||
            "https://via.placeholder.com/600x400?text=Нет+фото"
          }
          alt={costume.title}
          className="costume-image"
        />

        <div className="info">
          <h2>{costume.title}</h2>
          <div className="details-section">
            {costume.sizes?.length > 0 && (
              <p>
                <strong>Размеры:</strong> {costume.sizes.join(", ")}
              </p>
            )}
            {costume.heightRange && (
              <p>
                <strong>Рост:</strong> {costume.heightRange}
              </p>
            )}
            {costume.notes && (
              <p>
                <strong>Примечание:</strong> {costume.notes}
              </p>
            )}
          </div>

          <div className="price-block">
            <span className="price">{costume.price} ₽</span>
            <span className="label">за аренду</span>
          </div>

          
        </div>
      </div>

      <button
        className="main-btn"
        onClick={() => navigate(`/book/${costume._id}`)}
      >
        Забронировать
      </button>
    </div>
  );
}
