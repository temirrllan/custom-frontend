import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCostumes } from "../api/api";

export default function CostumeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [costume, setCostume] = useState<any>(null);

  useEffect(() => {
    getCostumes().then(all => {
      setCostume(all.find((c: any) => c._id === id));
    });
  }, [id]);

  if (!costume) return <p>Загрузка...</p>;

  return (
    <div style={{ padding: 16 }}>
      <img
        src={costume.photos?.[0]}
        alt={costume.title}
        style={{ width: "100%", borderRadius: 8 }}
      />
      <h2>{costume.title}</h2>
      <p>Цена: {costume.price} ₽</p>
      <button onClick={() => navigate(`/book/${costume._id}`)}>Забронировать</button>
    </div>
  );
}
