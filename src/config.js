const raw =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "https://botseller-production.up.railway.app" : "http://localhost:3000");

export const API_URL = String(raw).replace(/\/$/, "");
