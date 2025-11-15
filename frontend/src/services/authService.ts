import api, { apiService } from './api';
import { API_CONFIG } from '@/config/api';
import type { UserProfile } from '@/types';
import { decodeJwtPayload } from '@/utils/jwt';

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

export interface TokenResponse {
  accessToken: string | null;
  refreshToken: string | null;
  mfaRequired: boolean;
}

export interface LoginResult {
  success: boolean;
  requiresOtp?: boolean;
  message?: string;
  tokens?: TokenResponse;
}

const DEVICE_ID_STORAGE_KEY = 'cat_shop_device_id';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_EMAIL_KEY = 'user_email';

const getOrCreateDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
  }
  return deviceId;
};

const storeTokens = (tokens: TokenResponse | undefined, email: string) => {
  if (!tokens || !tokens.accessToken || !tokens.refreshToken) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  localStorage.setItem(USER_EMAIL_KEY, email);
};

const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
};

// Auth Service
export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResult> {
    try {
      // Xóa token cũ trước khi đăng nhập để tránh xung đột
      clearTokens();
      
      const deviceId = getOrCreateDeviceId();
      
      console.log('🔐 Attempting login:', {
        email: credentials.email,
        hasPassword: !!credentials.password,
        deviceId
      });
      
      const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email,
        password: credentials.password,
        deviceId,
      });

      console.log('✅ Login response:', response.data);

      const payload = response.data;
      const data = payload?.data as TokenResponse | null | undefined;
      const message = payload?.message as string | undefined;

      if (data && data.accessToken) {
        storeTokens(data, credentials.email);
        return {
          success: true,
          tokens: data,
          message,
        };
      }

      return {
        success: false,
        requiresOtp: true,
        message: message ?? 'Thiết bị mới phát hiện. Mã OTP đã được gửi đến email của bạn.',
      };
    } catch (error: any) {
      console.error('❌ Login error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      // Xử lý timeout: Nếu request timeout nhưng user đã nhận được OTP (thiết bị mới)
      // → Vẫn chuyển sang màn hình OTP
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        // Timeout có thể do backend chậm, nhưng nếu user đã nhận được OTP
        // → Giả định là thiết bị mới và cần OTP
        return {
          success: false,
          requiresOtp: true,
          message: 'Thiết bị mới phát hiện. Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra email và nhập mã OTP.',
        };
      }
      
      // Lấy thông báo lỗi từ backend ApiResponse
      let errorMessage = 'Email hoặc mật khẩu không chính xác';
      
      if (error.response?.data) {
        // Backend trả về ApiResponse với cấu trúc: { status, code, message, data }
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.status === 500) {
          // Lỗi 500 - Internal Server Error
          errorMessage = error.response.data.message || 
                        error.response.data.error || 
                        'Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Đảm bảo không có lỗi "token" khi đăng nhập
      if (errorMessage.toLowerCase().includes('token')) {
        errorMessage = 'Email hoặc mật khẩu không chính xác';
      }
      
      throw new Error(errorMessage);
    }
  },

  async register(userData: RegisterRequest): Promise<void> {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '',
        address: userData.address || '',
      });
    } catch (error: any) {
      console.error('Register error:', error);
      
      // Lấy thông báo lỗi từ backend ApiResponse
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại sau.';
      
      if (error.response?.data) {
        // Backend trả về ApiResponse với cấu trúc: { status, code, message, data }
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, null, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    const newAccessToken = response.data?.data as string;
    if (!newAccessToken) {
      throw new Error('Không nhận được access token mới');
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
    return newAccessToken;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, newPassword }
    );
  },

  async getProfile(email?: string): Promise<UserProfile> {
    try {
      const storedEmail = email ?? localStorage.getItem(USER_EMAIL_KEY);
      if (!storedEmail) {
        throw new Error('User email not found');
      }

      const user = await apiService.get<UserProfile>(`/users/email/${encodeURIComponent(storedEmail)}`);
      return user;
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      const email = localStorage.getItem(USER_EMAIL_KEY);
      if (email) {
        await api.post(
          API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
          null,
          {
            headers: {
              Authorization: `Bearer ${email}`,
            },
          }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Lưu ý: Backend TỰ ĐỘNG gửi OTP khi login với thiết bị mới
  // Không cần endpoint riêng để gửi OTP
  // Nếu cần gửi lại OTP, user phải đăng nhập lại

  async verifyOTP(email: string, otp: string): Promise<TokenResponse> {
    try {
      const deviceId = getOrCreateDeviceId();
      
      console.log('🔐 Verifying OTP:', {
        email,
        otpLength: otp.length,
        deviceId
      });
      
      const response = await apiService.post<TokenResponse>(
        API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP,
        { email, otp, deviceId }
      );

      console.log('✅ Verify OTP response:', response);

      // Nếu có mfaRequired, OTP đã đúng nhưng cần thêm bước Google Authenticator
      // Trong trường hợp này, backend có thể không trả về accessToken ngay
      if (response.mfaRequired && !response.accessToken) {
        // OTP đúng nhưng cần MFA - không lưu token, trả về response với mfaRequired
        return response;
      }

      // Nếu có accessToken, lưu token
      if (response.accessToken) {
        storeTokens(response, email);
      }

      return response;
    } catch (error: any) {
      console.error('❌ Verify OTP error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      // Lấy thông báo lỗi từ backend
      let errorMessage = 'Xác thực OTP thất bại';
      
      if (error.response?.data) {
        // Backend trả về ApiResponse với cấu trúc: { status, code, message, data }
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.status === 400) {
          // Lỗi 400 - Bad Request (có thể là OTP sai, hết hạn, hoặc format không đúng)
          errorMessage = error.response.data.message || 
                        error.response.data.error || 
                        'Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  parseAccessToken(): { email: string; role?: string } | null {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    if (!payload) return null;
    return {
      email: (payload.sub as string) || '',
      role: (payload.role as string) || undefined,
    };
  },

  // QR Login methods
  async generateQrCode(): Promise<{ sessionId: string; qrCodeBase64: string; expiresIn: number }> {
    try {
      const response = await apiService.post<{ sessionId: string; qrCodeBase64: string; expiresIn: number }>(
        '/auth/qr/generate',
        {}
      );
      return response;
    } catch (error: any) {
      console.error('Generate QR code error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo QR code';
      throw new Error(errorMessage);
    }
  },

  async checkQrStatus(sessionId: string): Promise<{ status: string; tokens?: TokenResponse; message: string }> {
    try {
      const response = await apiService.get<{ status: string; tokens?: TokenResponse; message: string }>(
        `/auth/qr/status/${sessionId}`
      );
      return response;
    } catch (error: any) {
      console.error('Check QR status error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể kiểm tra trạng thái';
      throw new Error(errorMessage);
    }
  },
};
