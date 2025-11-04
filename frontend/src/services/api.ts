import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, buildUrl } from '@/config/api';

// Tạo axios instance với cấu hình mặc định
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - thêm token vào header
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log('Making API request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL
      });
      
      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor - xử lý response và lỗi
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log('API response received:', {
        status: response.status,
        url: response.config.url
      });
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      // Xử lý lỗi 401 (Unauthorized)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const response = await instance.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, {
              refresh_token: refreshToken
            });
            
            const { access_token } = response.data;
            localStorage.setItem('access_token', access_token);
            
            // Thử lại request gốc
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token thất bại, redirect về login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
      
      console.error('API Error:', {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url,
        data: error.response?.data
      });
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Tạo instance chính
export const api = createApiInstance();

// API Response Types - khớp với backend Java ApiResponse
export interface ApiResponse<T = any> {
  status: string;
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic API methods
export const apiService = {
  // GET request
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.get<ApiResponse<T>>(url, config);
    console.log(`📡 API GET ${url}:`, {
      fullResponse: response.data,
      extractedData: response.data.data,
      dataLength: Array.isArray(response.data.data) ? response.data.data.length : 'not array'
    });
    return response.data.data;
  },

  // POST request
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  // PUT request
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  // PATCH request
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  },

  // Upload file
  upload: async <T = any>(url: string, file: File, config?: AxiosRequestConfig): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }
};

export default api;

