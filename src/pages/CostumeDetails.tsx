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
    <div className="details-container">
      <div className="image-wrapper">
        <img
          src={costume.photos?.[0] || "https://via.placeholder.com/600x400?text=Нет+фото"}
          alt={costume.title}
          className="costume-image"
        />
      </div>

      <div className="details-info">
        <h2>{costume.title}</h2>
        {costume.description && <p className="description">{costume.description}</p>}
        <p className="price">{costume.price} ₽</p>

        <button
          className="book-btn"
          onClick={() => navigate(`/book/${costume._id}`)}
        >
          Забронировать
        </button>
      </div>
    </div>
  );
}
