import WebApp from "@twa-dev/sdk";

const API_URL = import.meta.env.VITE_API_URL;

const headers = (): HeadersInit => ({
  "Content-Type": "application/json",
  "x-tg-id": String(WebApp.initDataUnsafe?.user?.id || "0"),
});

export async function getAdminCostumes() {
  const res = await fetch(`${API_URL}/api/admin/costumes`, { headers: headers() });
  return res.json();
}

export async function createCostume(data: any) {
  const res = await fetch(`${API_URL}/api/admin/costumes`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateCostume(id: string, data: any) {
  const res = await fetch(`${API_URL}/api/admin/costumes/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCostume(id: string) {
  const res = await fetch(`${API_URL}/api/admin/costumes/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  return res.json();
}
