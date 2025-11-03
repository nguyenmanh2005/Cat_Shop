// src/api/apiClient.ts
import axios from "axios";
import { API_CONFIG } from "@/config/api";

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor để tự động gắn token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor để xử lý lỗi chung
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    if (error.response?.status === 401) {
      console.warn("Token hết hạn hoặc không hợp lệ");
      // TODO: xử lý refresh token hoặc logout
    }
    return Promise.reject(error);
  }
);

export default apiClient;
