import { useEffect, useState } from "react";
import { getCostumes } from "../api/api";
import { useNavigate } from "react-router-dom";
import CostumeCard from "../components/CostumeCard";
import "./Catalog.css";

export default function Catalog() {
  const [costumes, setCostumes] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getCostumes()
      .then(setCostumes)
      .catch((err) => console.error("Ошибка загрузки каталога:", err));
  }, []);

  return (
    <div className="catalog-container">
      <h2 className="catalog-title">Каталог костюмов</h2>
      {costumes.length === 0 && (
        <p className="empty-text">Костюмы не найдены 😢</p>
      )}
      <div className="catalog-grid">
        {costumes.map((c) => (
          <CostumeCard
            key={c._id}
            costume={c}
            onClick={() => navigate(`/costume/${c._id}`)}
          />
        ))}
      </div>
    </div>
  );
}
