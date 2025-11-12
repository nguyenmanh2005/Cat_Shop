import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // Cho phép truy cập từ mọi network interface (localhost, LAN, etc.)
    port: 5173, // Đổi port về 5173 để tránh conflict với Spring Boot
    strictPort: false, // Tự động tìm port khác nếu 5173 bị chiếm
    // Proxy để tránh CORS khi phát triển
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Spring Boot chạy trên port 8080
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api') // Giữ nguyên path /api
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
