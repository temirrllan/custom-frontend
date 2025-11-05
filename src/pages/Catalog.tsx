import { useEffect, useState } from "react";
import { getCostumes } from "../api/api";
import { useNavigate } from "react-router-dom";
import CostumeCard from "../components/CostumeCard";

export default function Catalog() {
  const [costumes, setCostumes] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getCostumes().then(setCostumes);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Каталог костюмов</h2>
      {costumes.map(c => (
        <CostumeCard
          key={c._id}
          costume={c}
          onClick={() => navigate(`/costume/${c._id}`)}
        />
      ))}
    </div>
  );
}
