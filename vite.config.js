import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "https://botseller-production.up.railway.app",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    host: true,
    proxy: {
      "/api": {
        target: "https://botseller-production.up.railway.app",
        changeOrigin: true,
      },
    },
  },
});
