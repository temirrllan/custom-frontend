import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE,
});

export async function getCostumes() {
  const res = await api.get("/api/costumes");
  return res.data;
}

export async function createBooking(data: any) {
  const res = await api.post("/api/bookings", data);
  return res.data;
}
