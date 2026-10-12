const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export function getToken() { return localStorage.getItem("ecoloop_token"); }
export async function api(path, options = {}) {
  const headers = { ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}
export function imageUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : `http://localhost:5000${path}`;
}
