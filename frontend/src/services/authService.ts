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
  // Đăng nhập - giải pháp tạm thời vì backend chưa có endpoint login
  // Sử dụng email để lấy user info và lưu vào localStorage
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Backend không có endpoint login, tạm thời dùng email để lấy user info
      // Lưu ý: Đây chỉ là giải pháp tạm thời, cần implement authentication đầy đủ ở backend
      const userData = await apiService.get<User>(`/users/email/${encodeURIComponent(credentials.email)}`);
      
      // Tạo một AuthResponse giả để tương thích
      // Lưu email vào localStorage để dùng cho các request khác (X-USER-EMAIL header)
      localStorage.setItem('user_email', credentials.email);
      
      const authResponse: AuthResponse = {
        user: {
          userId: (userData as any).user_id || userData.userId,
          username: userData.username,
          email: userData.email,
          phone: userData.phone,
          roleId: (userData as any).role_id || userData.roleId,
        } as any,
        access_token: 'temp_token_' + credentials.email, // Token tạm thời
        refresh_token: '',
        expires_in: 0
      };
      
      return authResponse;
    } catch (error: any) {
      console.error('Login error:', error);
      // Ném lại error với message rõ ràng hơn
      const errorMessage = error.response?.data?.message || error.message || 'Email hoặc mật khẩu không chính xác';
      throw new Error(errorMessage);
    }
  },

  // Đăng ký - sử dụng endpoint /api/users vì backend không có /api/auth/register
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Backend sử dụng /api/users để tạo user mới
      const userResponse = await apiService.post<any>(
        '/users',
        {
          username: userData.username,
          email: userData.email,
          password: userData.password,
          phone: userData.phone || '',
          address: userData.address || ''
        }
      );
      
      // Backend không trả về token khi đăng ký, chỉ trả về UserResponse
      // Tạo một AuthResponse giả để tương thích với interface
      const authResponse: AuthResponse = {
        user: {
          userId: 0, // Sẽ được lấy từ profile sau
          username: userResponse.username || userData.username,
          email: userResponse.email || userData.email,
          phone: userResponse.phone || userData.phone,
          roleId: 2, // Mặc định là user
        } as any,
        access_token: '', // Không có token sau khi đăng ký
        refresh_token: '',
        expires_in: 0
      };
      
      return authResponse;
    } catch (error: any) {
      console.error('Register error:', error);
      // Ném lại error với message rõ ràng hơn
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

  // Lấy thông tin profile - giải pháp tạm thời vì backend không có endpoint profile
  async getProfile(): Promise<User> {
    try {
      const userEmail = localStorage.getItem('user_email');
      if (!userEmail) {
        throw new Error('User email not found');
      }
      // Sử dụng endpoint /users/email/{email} để lấy user info
      const user = await apiService.get<User>(`/users/email/${encodeURIComponent(userEmail)}`);
      return user;
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Đăng xuất
  async logout(): Promise<void> {
    try {
      // Backend không có endpoint logout, chỉ cần xóa dữ liệu local
      // await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Xóa token và email khỏi localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_email');
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
  },

  // Gửi OTP đến email
  async sendOTP(email: string): Promise<{ message: string; sessionId?: string }> {
    return apiService.post<{ message: string; sessionId?: string }>(
      API_CONFIG.ENDPOINTS.AUTH.SEND_OTP,
      { email: email }
    );
  },

  // Xác thực OTP
  async verifyOTP(email: string, otp: string, sessionId?: string): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP,
      { email: email, otp, sessionId }
    );
    
    // Lưu token vào localStorage
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    
    return response;
  },

  // Tạo QR code cho đăng nhập
  async generateQRCode(): Promise<{ qrCode: string; sessionId: string; expiresAt: number }> {
    return apiService.post<{ qrCode: string; sessionId: string; expiresAt: number }>(
      API_CONFIG.ENDPOINTS.AUTH.GENERATE_QR
    );
  },

  // Xác thực QR code (polling để kiểm tra khi user quét QR)
  async verifyQRCode(sessionId: string): Promise<AuthResponse | null> {
    try {
      const response = await apiService.post<AuthResponse | null>(
        API_CONFIG.ENDPOINTS.AUTH.VERIFY_QR,
        { sessionId }
      );
      
      if (response && response.access_token) {
        // Lưu token vào localStorage
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        return response;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
};
