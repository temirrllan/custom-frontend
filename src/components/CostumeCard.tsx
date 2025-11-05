export default function CostumeCard({ costume, onClick }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        border: "1px solid #ddd",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        cursor: "pointer"
      }}
    >
      <img
        src={costume.photos?.[0]}
        alt={costume.title}
        style={{ width: "100%", borderRadius: 8 }}
      />
      <h3>{costume.title}</h3>
      <p>Цена: {costume.price} ₽</p>
    </div>
  );
}
