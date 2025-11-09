import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCostumes } from "../api/api";
import "./CostumeDetails.css";

export default function CostumeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [costume, setCostume] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0); // для слайдера

  useEffect(() => {
    getCostumes().then((all) => {
      setCostume(all.find((c: any) => c._id === id));
    });
  }, [id]);

  if (!costume) return <p className="loading-text">Загрузка костюма...</p>;

  const photos = costume.photos?.length ? costume.photos : [];

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? photos.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === photos.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="page-container">
      <header className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className="page-title">{costume.title}</h1>
      </header>

      <div className="card">
        {/* --- СЛАЙДЕР ФОТО --- */}
        {photos.length > 0 ? (
          <div className="slider">
            <div
              className="slides"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {photos.map((url: string, idx: number) => (
                <img
                  key={idx}
                  src={url}
                  alt={`${costume.title} ${idx + 1}`}
                  className="slide-image"
                />
              ))}
            </div>

            {photos.length > 1 && (
              <>
                <button className="nav-btn left" onClick={prevSlide}>
                  ‹
                </button>
                <button className="nav-btn right" onClick={nextSlide}>
                  ›
                </button>

               {/* точки-пагинация */}
<div className="dots">
  {photos.map((_: string, i: number) => (
    <span
      key={i}
      className={`dot ${i === currentIndex ? "active" : ""}`}
      onClick={() => setCurrentIndex(i)}
    />
  ))}
</div>

              </>
            )}
          </div>
        ) : (
          <img
            src="https://via.placeholder.com/600x400?text=Нет+фото"
            alt="Нет фото"
            className="costume-image"
          />
        )}

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
        className="main-btn"
        onClick={() => navigate(`/book/${costume._id}`)}
      >
        Забронировать
      </button>
    </div>
  );
}
