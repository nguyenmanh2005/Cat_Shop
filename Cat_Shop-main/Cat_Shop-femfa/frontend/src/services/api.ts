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

  // Request interceptor - thêm token và API key vào header
  instance.interceptors.request.use(
    (config) => {
      // Danh sách các endpoint không cần access token (public endpoints)
      // Lưu ý: /auth/refresh cần refresh token nhưng được xử lý riêng trong authService
      const publicEndpoints = [
        '/auth/login',
        '/auth/register',
        '/auth/verify-otp',
        '/auth/send-otp',
        '/auth/mfa/verify',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/auth/qr/generate',
        '/auth/qr/confirm',
        '/auth/qr/status',
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/verify-otp',
        '/api/auth/send-otp',
        '/api/auth/mfa/verify',
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
        '/api/auth/qr/generate',
        '/api/auth/qr/confirm',
        '/api/auth/qr/status',
        // Public customer endpoints - không cần authentication
        '/customer/categories',
        '/categories/customer',
        '/api/customer/categories',
        '/api/categories/customer',
      ];
      
      const isPublicEndpoint = config.url && publicEndpoints.some(endpoint => 
        config.url?.includes(endpoint)
      );
      
      // Với public endpoints: XÓA Authorization header nếu có (tránh gửi token cũ)
      if (isPublicEndpoint) {
        // Xóa Authorization header để đảm bảo không gửi token cũ
        delete config.headers.Authorization;
      } else {
        // Chỉ thêm token nếu không phải public endpoint
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      
      // Thêm X-USER-EMAIL header cho các request cần authentication (backend yêu cầu)
      const userEmail = localStorage.getItem('user_email');
      
      // Thêm API key và X-USER-EMAIL cho các request đến /api/users
      if (config.url?.includes('/users')) {
        // Loại trừ POST /api/users (đăng ký) và GET /api/users/email/{email} (login)
        const isRegister = config.method?.toLowerCase() === 'post' && config.url === '/users';
        const isLogin = config.url?.includes('/users/email/');
        
        if (!isRegister && !isLogin && !isPublicEndpoint) {
          // Các request GET/PUT/DELETE đến /api/users (trừ login) cần API key và email
          config.headers['X-API-KEY'] = 'secret123';
          if (userEmail) {
            config.headers['X-USER-EMAIL'] = userEmail;
          }
        }
        // POST /api/users (đăng ký) và GET /api/users/email/{email} (login) không cần header này
      } else if (userEmail && !isPublicEndpoint) {
        // Các request khác cần X-USER-EMAIL nếu user đã đăng nhập (trừ public endpoints)
        config.headers['X-USER-EMAIL'] = userEmail;
      }
      
      console.log('Making API request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        isPublicEndpoint,
        hasToken: !!localStorage.getItem('access_token'),
        hasUserEmail: !!localStorage.getItem('user_email')
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
      
      // Danh sách các endpoint không nên thử refresh token khi bị 401
      const publicEndpoints = [
        '/auth/login',
        '/auth/register',
        '/auth/verify-otp',
        '/auth/send-otp',
        '/auth/mfa/verify',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/verify-otp',
        '/api/auth/send-otp',
        '/api/auth/mfa/verify',
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
        // Public customer endpoints - không cần authentication
        '/customer/categories',
        '/categories/customer',
        '/api/customer/categories',
        '/api/categories/customer',
      ];
      
      const isPublicEndpoint = originalRequest.url && publicEndpoints.some(endpoint => 
        originalRequest.url?.includes(endpoint)
      );
      
      // Xử lý lỗi 401 (Unauthorized) - chỉ thử refresh token nếu không phải public endpoint
      if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const response = await instance.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, null, {
              headers: {
                Authorization: `Bearer ${refreshToken}`
              }
            });
            
            const newAccessToken = response.data?.data;
            if (newAccessToken) {
              localStorage.setItem('access_token', newAccessToken);
              
              // Thử lại request gốc với token mới
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return instance(originalRequest);
            }
          }
        } catch (refreshError) {
          // Refresh token thất bại, xóa tokens và redirect về login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_email');
          // Không redirect nếu đang ở trang login
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/auth-flow')) {
            window.location.href = '/auth-flow/login';
          }
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

