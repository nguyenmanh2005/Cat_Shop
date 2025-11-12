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
      const deviceId = getOrCreateDeviceId();
      const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email,
        password: credentials.password,
        deviceId,
      });

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
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Email hoặc mật khẩu không chính xác';
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
      const errorMessage = error.response?.data?.message || error.message || 'Đăng ký thất bại';
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

  async verifyOTP(email: string, otp: string): Promise<TokenResponse> {
    const deviceId = getOrCreateDeviceId();
    const response = await apiService.post<TokenResponse>(
      API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP,
      { email, otp, deviceId }
    );

    if (response.accessToken) {
      storeTokens(response, email);
    }

    return response;
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
};
