import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCostumes } from "../api/api";
import "./CostumeDetails.css";

export default function CostumeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [costume, setCostume] = useState<any>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    getCostumes().then((all) => {
      setCostume(all.find((c: any) => c._id === id));
    });
  }, [id]);

  if (!costume) return <p className="loading-text">Загрузка костюма...</p>;

  const photos = costume.photos && costume.photos.length > 0
    ? costume.photos
    : ["https://via.placeholder.com/600x400?text=Нет+фото"];

  const nextPhoto = () => {
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="page-container">
      <header className="header">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className="page-title">{costume.title}</h1>
      </header>

      <div className="card">
        <div className="image-slider">
          <img
            src={photos[photoIndex]}
            alt={costume.title}
            className="costume-image"
          />

          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="nav-btn prev"
                onClick={prevPhoto}
              >
                ‹
              </button>
              <button
                type="button"
                className="nav-btn next"
                onClick={nextPhoto}
              >
                ›
              </button>

              <div className="dots">
                {photos.map((_: string, i: number) => (
                  <button
                    type="button"
                    key={i}
                    className={`dot ${i === photoIndex ? "active" : ""}`}
                    onClick={() => setPhotoIndex(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="info">
          <h2>{costume.title}</h2>
          <p className="desc">
            {costume.description || "Описание отсутствует"}
          </p>

          <div className="price-block">
            <span className="price">{costume.price} ₽</span>
            <span className="label">за аренду</span>
          </div>

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
        </div>
      </div>

      <button
        type="button"
        className="main-btn"
        onClick={() => navigate(`/book/${costume._id}`)}
      >
        Забронировать
      </button>
    </div>
  );
}
