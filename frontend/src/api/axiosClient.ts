import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api", // ✅ URL gốc của backend Spring Boot
  headers: {
    "Content-Type": "application/json",
  },
});

// 👉 (Tuỳ chọn) Tự động thêm token nếu có Auth
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosClient;
