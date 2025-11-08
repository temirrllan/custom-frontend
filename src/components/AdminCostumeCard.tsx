import "./AdminCostumeCard.css";

export default function AdminCostumeCard({ costume, onEdit, onDelete }: any) {
  const isHidden = !costume.available;

  return (
    <div className={`admin-costume-card ${isHidden ? "disabled" : ""}`}>
      <div className="photo-wrapper">
        <img
          src={costume.photos?.[0] || "/no-photo.png"}
          alt={costume.title}
        />
        {isHidden && <div className="overlay">🚫 Недоступен</div>}
      </div>

      <div className="info">
        <h3>{costume.title}</h3>
        <p>{costume.price} ₽</p>
      </div>

      <div className="actions">
        <button onClick={onEdit}>✏️</button>
        <button className="danger" onClick={onDelete}>🗑️</button>
      </div>
    </div>
  );
}
