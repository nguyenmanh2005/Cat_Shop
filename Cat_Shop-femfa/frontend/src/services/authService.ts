import api, { apiService } from './api';
import { API_CONFIG } from '@/config/api';
import type { UserProfile } from '@/types';
import { decodeJwtPayload } from '@/utils/jwt';

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
  captchaToken?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  captchaToken?: string;
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

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_EMAIL_KEY = 'user_email';

// Import device fingerprint utility
import { getOrCreateDeviceFingerprint, getDeviceFingerprintSync } from '@/utils/deviceFingerprint';

/**
 * Lấy deviceId - ưu tiên dùng FingerprintJS, fallback về sync method
 */
const getOrCreateDeviceId = async (): Promise<string> => {
  // Thử lấy đồng bộ trước (nếu đã có trong cache/localStorage)
  const syncId = getDeviceFingerprintSync();
  if (syncId) {
    return syncId;
  }

  // Nếu chưa có, dùng FingerprintJS (async)
  return await getOrCreateDeviceFingerprint();
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
      
      const deviceId = await getOrCreateDeviceId();
      
      console.log('🔐 Attempting login:', {
        email: credentials.email,
        hasPassword: !!credentials.password,
        deviceId
      });
      
      const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email,
        password: credentials.password,
        deviceId,
        captchaToken: credentials.captchaToken,
      });

      console.log('✅ Login response:', response.data);

      const payload = response.data;
      const data = payload?.data as TokenResponse | null | undefined;
      const message = payload?.message as string | undefined;

      // QUAN TRỌNG: KHÔNG lưu token ngay cả khi backend trả về token
      // Bắt buộc người dùng phải xác minh (OTP, QR, hoặc Google Authenticator) trước khi cho phép truy cập
      // Token chỉ được lưu sau khi xác minh thành công
      if (data && data.accessToken) {
        // KHÔNG lưu token ở đây - chỉ trả về thông tin để frontend biết đăng nhập thành công
        // Nhưng vẫn yêu cầu xác minh
        return {
          success: false,
          requiresOtp: true,
          message: message ?? 'Vui lòng xác minh tài khoản để tiếp tục đăng nhập.',
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
        captchaToken: userData.captchaToken,
        // Yêu cầu backend KHÔNG gửi email link kích hoạt, chỉ tạo user (sẽ gửi OTP riêng sau)
        skipEmailVerification: true,
        useOtpVerification: true,
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

  // Đặt lại mật khẩu bằng OTP gửi qua email
  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    try {
      return await apiService.post<{ message: string }>(
        API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
        { email, otp, newPassword }
      );
    } catch (error: any) {
      console.error("Reset password error:", error);

      // Lấy message rõ ràng từ backend nếu có
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Không thể đặt lại mật khẩu. Vui lòng thử lại.";

      // Thay thế message mặc định của Axios
      throw new Error(backendMessage);
    }
  },

  async getProfile(email?: string): Promise<UserProfile> {
    try {
      const storedEmail = email ?? localStorage.getItem(USER_EMAIL_KEY);
      if (!storedEmail) {
        throw new Error('User email not found');
      }

      const user = await apiService.get<UserProfile>(`/users/email/${encodeURIComponent(storedEmail)}`);
      console.log('📱 getProfile response:', user);
      console.log('📱 Phone field:', user?.phone);
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

  async sendOtp(email: string): Promise<{ message: string }> {
    try {
      const response = await apiService.post<{ message: string }>(
        API_CONFIG.ENDPOINTS.AUTH.SEND_OTP,
        { email }
      );
      return response;
    } catch (error: any) {
      console.error('Send OTP error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể gửi OTP';
      throw new Error(errorMessage);
    }
  },

  async verifyOTP(email: string, otp: string): Promise<TokenResponse> {
    try {
      const deviceId = await getOrCreateDeviceId();
      
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

  // OTP Register (cho user mới đăng ký - tách riêng với OTP đăng nhập)
  // Tạm thời dùng endpoint chung /auth/send-otp cho đến khi backend implement /auth/register/send-otp
  async sendRegisterOtp(email: string): Promise<{ message: string }> {
    try {
      // Thử dùng endpoint riêng trước, nếu 404 thì fallback về endpoint chung
      try {
        const response = await apiService.post<{ message: string }>(
          API_CONFIG.ENDPOINTS.AUTH.REGISTER_SEND_OTP,
          { email }
        );
        return response;
      } catch (error: any) {
        // Nếu endpoint riêng chưa có (404), dùng endpoint chung
        if (error.response?.status === 404) {
          console.warn('Register OTP endpoint not found, using common OTP endpoint');
          // Dùng endpoint chung /auth/send-otp
          const response = await apiService.post<{ message: string }>(
            API_CONFIG.ENDPOINTS.AUTH.SEND_OTP,
            { email }
          );
          return response;
        }
        
        // Xử lý trường hợp email đã tồn tại (400/409) - có thể là chưa verify
        const status = error.response?.status;
        const errorMsg = error.response?.data?.message || error.message || '';
        const isEmailExists = errorMsg.includes('đã được đăng ký') || 
                             errorMsg.includes('already registered') || 
                             errorMsg.includes('đã tồn tại') || 
                             errorMsg.includes('already exists') ||
                             errorMsg.includes('Email already') ||
                             status === 409;
        
        if (isEmailExists) {
          // Email đã tồn tại - thử dùng endpoint chung để gửi OTP verify lại
          console.warn('Email already exists, attempting to resend OTP for verification');
          try {
            const response = await apiService.post<{ message: string }>(
              API_CONFIG.ENDPOINTS.AUTH.SEND_OTP,
              { email }
            );
            return response;
          } catch (resendError: any) {
            // Nếu vẫn lỗi, thông báo rõ ràng
            const resendMsg = resendError.response?.data?.message || resendError.message || '';
            throw new Error(`Email này đã được đăng ký. ${resendMsg.includes('OTP') ? 'Đang gửi lại mã OTP để xác thực...' : 'Vui lòng kiểm tra email hoặc thử đăng nhập.'}`);
          }
        }
        
        throw error;
      }
    } catch (error: any) {
      console.error('Send Register OTP error:', error);
      let errorMessage = error.response?.data?.message || error.message || 'Không thể gửi mã OTP đăng ký';
      
      // Xử lý trường hợp email đã tồn tại - cho phép gửi OTP lại để verify
      const errorMsgLower = errorMessage.toLowerCase();
      if (errorMsgLower.includes('đã được đăng ký') || 
          errorMsgLower.includes('already registered') ||
          errorMsgLower.includes('đã tồn tại') ||
          errorMsgLower.includes('already exists')) {
        // Không throw error, mà thử gửi OTP lại qua endpoint chung
        try {
          console.log('Retrying OTP send via common endpoint for existing email');
          const response = await apiService.post<{ message: string }>(
            API_CONFIG.ENDPOINTS.AUTH.SEND_OTP,
            { email }
          );
          return response;
        } catch (retryError: any) {
          // Nếu vẫn lỗi, hiển thị thông báo thân thiện
          errorMessage = 'Email này đã được đăng ký. Nếu bạn chưa xác thực email, vui lòng kiểm tra hộp thư hoặc thử đăng nhập.';
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  async verifyRegisterOtp(email: string, otp: string): Promise<TokenResponse> {
    try {
      const deviceId = await getOrCreateDeviceId();
      
      console.log('🔐 Verifying Register OTP:', {
        email,
        otpLength: otp.length,
        deviceId
      });
      
      // Thử dùng endpoint riêng trước, nếu 404 thì fallback về endpoint chung
      let response: TokenResponse;
      try {
        response = await apiService.post<TokenResponse>(
          API_CONFIG.ENDPOINTS.AUTH.REGISTER_VERIFY_OTP,
          { email, otp, deviceId }
        );
      } catch (error: any) {
        // Nếu endpoint riêng chưa có (404), dùng endpoint chung
        if (error.response?.status === 404) {
          console.warn('Register verify OTP endpoint not found, using common OTP endpoint');
          response = await apiService.post<TokenResponse>(
            API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP,
            { email, otp, deviceId }
          );
        } else {
          throw error;
        }
      }

      console.log('✅ Verify Register OTP response:', response);

      // Nếu có accessToken, lưu token (đăng ký thành công + tự động đăng nhập)
      if (response.accessToken) {
        storeTokens(response, email);
      }

      return response;
    } catch (error: any) {
      console.error('❌ Verify Register OTP error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      let errorMessage = 'Xác thực OTP đăng ký thất bại';
      
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.message || 
                        error.response.data.error || 
                        'Mã OTP đăng ký không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.';
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
  // NOTE: Thời gian sống QR code (expiresIn) được quyết định bởi backend
  // Để tăng thời gian sống lên 30 phút, cần sửa backend:
  // - Tìm QR code generation endpoint trong backend
  // - Thay đổi expiresIn từ giá trị hiện tại (có thể là 5-10 phút) lên 1800 giây (30 phút)
  async generateQrCode(): Promise<{ sessionId: string; qrCodeBase64: string; expiresIn: number }> {
    try {
      const response = await apiService.post<{ sessionId: string; qrCodeBase64: string; expiresIn: number }>(
        '/auth/qr/generate',
        {}
      );
      console.log('📱 QR Code generated, expiresIn:', response.expiresIn, 'seconds');
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

  // Xác nhận QR login bằng access token đang có trên thiết bị (không cần nhập lại mật khẩu)
  async confirmQrLoginWithToken(sessionId: string): Promise<{ message: string }> {
    try {
      // Đảm bảo có token trước khi gọi
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        throw new Error('Access token không tồn tại. Vui lòng đăng nhập lại.');
      }
      
      console.log('🔐 [QR-LOGIN] Calling confirm-token with token:', token.substring(0, 20) + '...');
      
      // Sử dụng api trực tiếp để đảm bảo token được gửi đúng
      const response = await api.post(
        '/auth/qr/confirm-token',
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      // Extract data từ ApiResponse
      const responseData = response.data?.data || response.data;
      return responseData;
    } catch (error: any) {
      console.error('❌ Confirm QR login with token error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Không thể xác nhận đăng nhập QR';
      throw new Error(errorMessage);
    }
  },

  async verifyGoogleAuthenticator(email: string, code: string): Promise<TokenResponse> {
    try {
      console.log('🔐 Verifying Google Authenticator:', {
        email,
        codeLength: code.length,
      });
      
      const response = await apiService.post<TokenResponse>(
        API_CONFIG.ENDPOINTS.AUTH.MFA_VERIFY,
        { email, code }
      );

      console.log('✅ Verify Google Authenticator response:', response);

      // Nếu có accessToken, lưu token
      if (response.accessToken) {
        storeTokens(response, email);
      }

      return response;
    } catch (error: any) {
      console.error('❌ Verify Google Authenticator error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      
      // Lấy thông báo lỗi từ backend
      let errorMessage = 'Xác thực Google Authenticator thất bại';
      
      if (error.response?.data) {
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

  // SMS OTP methods
  async sendSmsOtp(phoneNumber: string): Promise<string> {
    try {
      // Backend trả về string message (trong ApiResponse.data)
      const response = await apiService.post<string>(
        API_CONFIG.ENDPOINTS.AUTH.SEND_SMS_OTP,
        { phoneNumber }
      );
      return response;
    } catch (error: any) {
      console.error('Send SMS OTP error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể gửi OTP qua SMS';
      throw new Error(errorMessage);
    }
  },

  async verifySmsOtp(email: string, phoneNumber: string, otp: string): Promise<{ success: boolean; message?: string; tokens?: TokenResponse }> {
    try {
      const deviceId = await getOrCreateDeviceId();
      
      console.log('🔐 Verifying SMS OTP:', {
        email,
        phoneNumber,
        otpLength: otp.length,
        deviceId
      });
      
      const response = await apiService.post<TokenResponse>(
        API_CONFIG.ENDPOINTS.AUTH.VERIFY_SMS_OTP,
        { email, phoneNumber, otp, deviceId }
      );

      console.log('✅ Verify SMS OTP response:', response);

      // Nếu có accessToken, lưu token
      if (response.accessToken) {
        storeTokens(response, email);
        return {
          success: true,
          tokens: response
        };
      }

      // Nếu có mfaRequired, OTP đã đúng nhưng cần thêm bước Google Authenticator
      if (response.mfaRequired && !response.accessToken) {
        return {
          success: false,
          message: 'OTP đúng nhưng cần xác minh Google Authenticator',
          tokens: response
        };
      }

      return {
        success: true,
        tokens: response
      };
    } catch (error: any) {
      console.error('❌ Verify SMS OTP error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      
      // Lấy thông báo lỗi từ backend
      let errorMessage = 'Xác thực OTP SMS thất bại';
      
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.status === 400) {
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

  // Verify SMS OTP cho đăng ký số điện thoại (không cần email)
  async verifySmsOtpForRegistration(phoneNumber: string, otp: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('🔐 Verifying SMS OTP for registration:', {
        phoneNumber,
        otpLength: otp.length,
      });
      
      // Backend cần có API: POST /auth/verify-sms-otp-register { phoneNumber, otp }
      // Tạm thời, chúng ta sẽ dùng API verify SMS OTP hiện có
      // TODO: Backend cần tạo API riêng cho registration
      const response = await apiService.post<{ success: boolean; message?: string }>(
        '/auth/verify-sms-otp-register', // Backend cần implement endpoint này
        { phoneNumber, otp }
      );

      console.log('✅ Verify SMS OTP for registration response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Verify SMS OTP for registration error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      // Lấy thông báo lỗi từ backend
      let errorMessage = 'Xác thực OTP SMS thất bại';
      
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.status === 400) {
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

  /**
   * Đổi mật khẩu từ email cảnh báo bảo mật
   * @param token Token từ email cảnh báo
   * @param newPassword Mật khẩu mới
   */
  async resetPasswordFromSecurityAlert(token: string, newPassword: string): Promise<void> {
    try {
      console.log('🔐 Resetting password from security alert');
      
      const response = await apiService.post<{ message: string }>(
        '/auth/reset-password-security',
        { token, newPassword }
      );

      console.log('✅ Reset password from security alert response:', response);
    } catch (error: any) {
      console.error('❌ Reset password from security alert error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      let errorMessage = 'Không thể đổi mật khẩu';
      
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.message || 
                        error.response.data.error || 
                        'Token không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },
};
