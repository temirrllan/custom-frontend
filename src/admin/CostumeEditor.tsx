// frontend/src/admin/CostumeEditor.tsx
import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useNavigate, useParams } from "react-router-dom";

export default function CostumeEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const [state, setState] = useState<any>({
    title: "", price: 0, sizes: [], photos: [], stockBySize: {}, available: true, description: ""
  });
  const [files, setFiles] = useState<FileList|null>(null);

  useEffect(() => {
    if (id && id !== "new") {
      adminApi.get(`/api/admin/costumes`).then(r => {
        const found = r.data.find((x:any)=>x._id===id);
        if (found) setState(found);
      });
    }
  }, [id]);

  const uploadFiles = async (): Promise<string[]> => {
    if (!files || files.length===0) return state.photos || [];
    const form = new FormData();
    for (let i=0;i<files.length;i++) form.append("photos", files[i]);
    const r = await adminApi.post("/api/admin/upload", form, { headers: { "Content-Type": "multipart/form-data" }});
    return r.data.urls;
  };

  const save = async () => {
    const urls = await uploadFiles();
    const payload = { ...state, photos: [...(state.photos||[]), ...urls] };
    if (id && id !== "new") {
      await adminApi.put(`/api/admin/costumes/${id}`, payload);
    } else {
      await adminApi.post(`/api/admin/costumes`, payload);
    }
    nav("/admin/costumes");
  };

  return (
    <div>
      <h2>{id==="new" ? "Новый костюм" : "Редактировать костюм"}</h2>
      <input placeholder="Название" value={state.title} onChange={e=>setState({...state, title:e.target.value})}/>
      <input placeholder="Цена" type="number" value={state.price} onChange={e=>setState({...state, price:Number(e.target.value)})}/>
      <textarea placeholder="Описание" value={state.description} onChange={e=>setState({...state, description:e.target.value})}/>
      <input type="file" multiple onChange={e=>setFiles(e.target.files)} />
      <div style={{marginTop:10}}>
        <button onClick={save}>Сохранить</button>
        <button onClick={()=>nav("/admin/costumes")}>Отмена</button>
      </div>
    </div>
  );
}
