
interface CostumeCardProps {
  costume: any;
  onClick: () => void;
}

export default function CostumeCard({ costume, onClick }: CostumeCardProps) {
  return (
    <div
      className="costume-card"
      onClick={onClick}
    >
      <img
        src={costume.photos?.[0] || "https://via.placeholder.com/300x400?text=No+Photo"}
        alt={costume.title}
        className="costume-image"
      />
      <div className="costume-info">
        <h3>{costume.title}</h3>
        {costume.price && <p className="price">{costume.price} ₽</p>}
        <button className="book-btn">Бронировать</button>
      </div>
    </div>
  );
}
