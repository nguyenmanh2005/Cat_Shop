/// <reference types="vite/client" />
import axios, { AxiosError, AxiosHeaders } from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

const API_URL = (() => {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl) return normalizeBaseUrl(envUrl);

  if (import.meta.env.DEV) return "/api";

  const fallback = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
  return `${normalizeBaseUrl(fallback)}/api`;
})();

const ACCESS_TOKEN_KEY = "authFlow.accessToken";
const REFRESH_TOKEN_KEY = "authFlow.refreshToken";
const DEVICE_ID_KEY = "authFlow.deviceId";

type FailedRequest = {
  resolver: (value: unknown) => void;
  rejecter: (reason?: unknown) => void;
  config: AxiosRequestConfig;
};

const ensureAxiosHeaders = (headers?: AxiosRequestConfig["headers"]) => {
  if (headers instanceof AxiosHeaders) return headers;
  return new AxiosHeaders(headers as any);
};

// Tạo axios instance chính dùng cho auth flow
// Tắt withCredentials để tránh CORS error khi backend dùng Access-Control-Allow-Origin: *
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false, // Tắt để tránh CORS error
  headers: {
    "Content-Type": "application/json",
  },
});

// Client riêng cho luồng refresh token, tránh interceptor đệ quy
const refreshClient = axios.create({
  baseURL: API_URL,
  withCredentials: false, // Tắt để tránh CORS error
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
const failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null) => {
  while (failedQueue.length) {
    const { resolver, rejecter, config } = failedQueue.shift()!;
    if (token) {
      const headers = ensureAxiosHeaders(config.headers);
      headers.set("Authorization", `Bearer ${token}`);
      config.headers = headers;
      resolver(axiosInstance(config));
    } else {
      rejecter(error);
    }
  }
};

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(DEVICE_ID_KEY);
  },
  getDeviceId: () => localStorage.getItem(DEVICE_ID_KEY),
  setDeviceId: (deviceId: string) => localStorage.setItem(DEVICE_ID_KEY, deviceId),
};

// Request interceptor: tự động thêm access token vào header
axiosInstance.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    const headers = ensureAxiosHeaders(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

// Response interceptor: tự động refresh token khi 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    // Chỉ xử lý 401 và chưa retry
    if (status !== 401 || !originalRequest || (originalRequest as any)._retry) {
      return Promise.reject(error);
    }

    // Nếu đang refresh → thêm vào queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolver: resolve, rejecter: reject, config: originalRequest });
      });
    }

    (originalRequest as any)._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        tokenStorage.clear();
        return Promise.reject(error);
      }

      // Gọi API refresh để lấy access token mới
      // Theo tài liệu: POST /auth/refresh với header Authorization: Bearer <refresh_token>
      // Response: { status: 200, message: "...", data: "<new_access_token>" }
      const { data } = await refreshClient.post<{
        status: number;
        message: string;
        data: string;
      }>(
        "/auth/refresh",
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        },
      );

      // Backend trả về data là string (access token mới)
      const newAccessToken = data.data;
      const currentRefreshToken = tokenStorage.getRefreshToken();

      // Lưu access token mới (refresh token giữ nguyên theo tài liệu)
      if (currentRefreshToken) {
        tokenStorage.setTokens(newAccessToken, currentRefreshToken);
      }

      processQueue(null, newAccessToken);

      // Retry request ban đầu với token mới
      const headers = ensureAxiosHeaders(originalRequest.headers);
      headers.set("Authorization", `Bearer ${newAccessToken}`);
      originalRequest.headers = headers;

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenStorage.clear();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;

