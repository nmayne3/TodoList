import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/album": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
