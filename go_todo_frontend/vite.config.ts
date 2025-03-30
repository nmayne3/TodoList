import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/albums": {
        target: "http://server:8080",
        changeOrigin: true,
      },
    },
    host: true,
    allowedHosts: ["client"],
  },
});
