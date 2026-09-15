const raw = import.meta.env.VITE_API_URL || "";

export const API_URL = String(raw).replace(/\/$/, "");
