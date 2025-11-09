import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCostumes } from "../api/api";
import { API_BASE } from "../api/admin";
import "./CostumeDetails.css";

export default function CostumeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [costume, setCostume] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    getCostumes().then((all) => {
      setCostume(all.find((c: any) => c._id === id));
    });
  }, [id]);

  // Формируем полные URL для фото
  const toFullUrl = (path?: string) => {
    if (!path) return "https://via.placeholder.com/600x400?text=Нет+фото";
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path}`;
  };

  if (!costume) return <p className="loading-text">Загрузка костюма...</p>;

  const photos = costume.photos?.length 
    ? costume.photos.map((p: string) => toFullUrl(p))
    : [];

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

  // Обработка свайпов
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe && photos.length > 1) {
      nextSlide();
    }
    if (isRightSwipe && photos.length > 1) {
      prevSlide();
    }
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
          <div 
            className="slider"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="slides"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {photos.map((url: string, idx: number) => (
                <div key={idx} className="slide-wrapper">
                  <img
                    src={url}
                    alt={`${costume.title} ${idx + 1}`}
                    className="slide-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/600x400?text=Ошибка+загрузки";
                    }}
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </div>

            {photos.length > 1 && (
              <>
                <button 
                  className="nav-btn left" 
                  onClick={prevSlide}
                  aria-label="Предыдущее фото"
                  type="button"
                >
                  ‹
                </button>
                <button 
                  className="nav-btn right" 
                  onClick={nextSlide}
                  aria-label="Следующее фото"
                  type="button"
                >
                  ›
                </button>

                <div className="dots">
                  {photos.map((_: string, i: number) => (
                    <button
                      key={i}
                      className={`dot ${i === currentIndex ? "active" : ""}`}
                      onClick={() => setCurrentIndex(i)}
                      aria-label={`Перейти к фото ${i + 1}`}
                      type="button"
                    />
                  ))}
                </div>

                <div className="slide-counter">
                  {currentIndex + 1} / {photos.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="no-photo">
            <img
              src="https://via.placeholder.com/600x400?text=Нет+фото"
              alt="Нет фото"
              className="costume-image"
            />
          </div>
        )}

        <div className="info">
          <div className="price-block">
            <span className="price">{costume.price} ₽</span>
            <span className="label">за аренду</span>
          </div>

          {costume.description && (
            <p className="desc">
              {costume.description}
            </p>
          )}

          <div className="details-section">
            {costume.sizes?.length > 0 && (
              <p>
                <strong>Размеры:</strong> 
                <span>{costume.sizes.join(", ")}</span>
              </p>
            )}
            {costume.heightRange && (
              <p>
                <strong>Рост:</strong> 
                <span>{costume.heightRange}</span>
              </p>
            )}
            {costume.notes && (
              <p>
                <strong>Примечание:</strong> 
                <span>{costume.notes}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        className="main-btn"
        onClick={() => navigate(`/book/${costume._id}`)}
        type="button"
      >
        Забронировать
      </button>
    </div>
  );
}
