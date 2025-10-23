import { apiService } from './api';
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
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    // Lưu token vào localStorage
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    
    return response;
  },

  // Đăng ký
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      userData
    );
    
    // Lưu token vào localStorage
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    
    return response;
  },

  // Làm mới token
  async refreshToken(): Promise<{ access_token: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiService.post<{ access_token: string }>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      { refresh_token: refreshToken }
    );
    
    // Cập nhật access token
    localStorage.setItem('access_token', response.access_token);
    
    return response;
  },

  // Quên mật khẩu
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
  },

  // Đặt lại mật khẩu
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, newPassword }
    );
  },

  // Lấy thông tin profile
  async getProfile(): Promise<User> {
    return apiService.get<User>(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
  },

  // Đăng xuất
  async logout(): Promise<void> {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
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
