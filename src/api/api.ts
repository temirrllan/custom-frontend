import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE,
});

export async function getCostumes() {
  const res = await fetch(`${API_BASE}/api/costumes`);
  if (!res.ok) throw new Error("Failed to fetch costumes");
  return res.json();
}

export async function createBooking(data: any) {
  const res = await api.post("/api/bookings", data);
  return res.data;
}
export async function getUserInfo(tgId: number) {
  const res = await fetch(`${API_URL}/api/users/${tgId}`);
  if (!res.ok) throw new Error("User not found");
  return res.json();
}