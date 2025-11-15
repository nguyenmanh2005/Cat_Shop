import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173, // Đổi port về 5173 để tránh conflict với Spring Boot
    // Proxy để tránh CORS khi phát triển
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Spring Boot chạy trên port 8080
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '') // Bỏ prefix /api vì backend không có prefix này
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
