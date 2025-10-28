import { api } from './api';
import { API_CONFIG } from '@/config/api';
import { User } from '@/types';

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// Auth Service
export const authService = {
  // Đăng nhập
  async login(credentials: LoginRequest): Promise<any> {
    console.log('🚀 Logging in:', credentials.email);
    console.log('📡 API URL:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.LOGIN);
    
    try {
      const response = await api.post(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials,
        {
          validateStatus: (status) => status < 500
        }
      );
      
      console.log('✅ Login response:', response);
      
      // Kiểm tra lỗi từ backend
      if (response.status >= 400) {
        const errorMessage = response.data?.message || 'Đăng nhập thất bại';
        throw new Error(errorMessage);
      }
      
      // Backend trả về: { status, code, message, data: { userId, username, email, ... }, timestamp }
      const userData = response.data.data || response.data;
      
      console.log('✅ User data:', userData);
      
      return userData;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('Error details:', error.response?.data);
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.');
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại';
      throw new Error(errorMessage);
    }
  },

  // Đăng ký
  async register(userData: RegisterRequest): Promise<any> {
    console.log('🚀 Registering user:', userData);
    console.log('📡 API URL:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.REGISTER);
    
    try {
      // Sử dụng axios trực tiếp để xử lý response đúng cách
      const response = await api.post(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData,
        {
          validateStatus: (status) => status < 500 // Cho phép status 400, 409
        }
      );
      
      console.log('✅ Register response:', response);
      
      // Kiểm tra lỗi từ backend
      if (response.status >= 400) {
        const errorMessage = response.data?.message || 'Đăng ký thất bại';
        throw new Error(errorMessage);
      }
      
      // Backend trả về ApiResponse: { status, code, message, data, timestamp }
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Register error:', error);
      console.error('Error details:', error.response?.data);
      
      // Xử lý lỗi network
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.');
      }
      
      // Xử lý lỗi từ backend
      const errorMessage = error.response?.data?.message || error.message || 'Đăng ký thất bại';
      throw new Error(errorMessage);
    }
  },

  // Làm mới token
  async refreshToken(): Promise<{ access_token: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<{ access_token: string }>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      { refresh_token: refreshToken }
    );
    
    // Cập nhật access token
    localStorage.setItem('access_token', response.data.access_token);
    
    return response.data;
  },

  // Quên mật khẩu
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
    return response.data;
  },

  // Đặt lại mật khẩu
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, newPassword }
    );
    return response.data;
  },

  // Lấy thông tin profile
  async getProfile(): Promise<User> {
    const response = await api.get<User>(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
    return response.data;
  },

  // Đăng xuất
  async logout(): Promise<void> {
    try {
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Xóa token khỏi localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  // Kiểm tra trạng thái đăng nhập
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  // Lấy access token
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },

  // Lấy refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }
};
