import { v4 as uuidv4 } from "uuid";
import axiosInstance, { tokenStorage } from "./axiosConfig";

// ========== TYPES ==========
export type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
};

export type LoginPayload = {
  email: string;
  password: string;
  deviceId?: string;
};

export type VerifyOtpPayload = {
  email: string;
  otp: string;
  deviceId: string;
};

export type VerifyMfaPayload = {
  email: string;
  code: number; // Backend nhận code là number, không phải string
};

// Backend response format: { status, message, data }
type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};

// Token response từ login/verify-otp/verify-mfa
type TokenData = {
  accessToken: string | null;
  refreshToken: string | null;
  mfaRequired: boolean;
};

// MFA enable response
type MfaEnableData = {
  secret: string;
  qrBase64: string;
};

// ========== HELPERS ==========
// Đảm bảo mỗi trình duyệt có một deviceId cố định
const ensureDeviceId = (): string => {
  const existing = tokenStorage.getDeviceId();
  if (existing) return existing;
  const newDeviceId = uuidv4();
  tokenStorage.setDeviceId(newDeviceId);
  return newDeviceId;
};

// Lưu token và email khi backend trả về
const saveTokens = (tokenData: TokenData | null | undefined, email?: string) => {
  if (tokenData?.accessToken && tokenData?.refreshToken) {
    tokenStorage.setTokens(tokenData.accessToken, tokenData.refreshToken);
    // Lưu email vào localStorage để dùng cho header X-USER-EMAIL
    if (email) {
      localStorage.setItem('user_email', email);
    }
  }
};

// ========== AUTH SERVICE ==========
export const authService = {
  /**
   * 1️⃣ Đăng ký tài khoản mới
   * POST /auth/register
   * Response: { status: 200, message: "User created successfully", data: "Tạo tài khoản thành công" }
   */
  register: async (payload: RegisterPayload): Promise<string> => {
    const response = await axiosInstance.post<ApiResponse<string>>("/auth/register", payload);
    return response.data.data; // Trả về message từ data
  },

  /**
   * 2️⃣ Đăng nhập bằng Email + Password + deviceId
   * POST /auth/login
   * Response có 2 trường hợp:
   * - Thiết bị mới: { status: 200, message: "Thiết bị mới phát hiện. Mã OTP đã được gửi đến email của bạn.", data: "" }
   * - Thiết bị quen: { status: 200, message: "Đăng nhập thành công (thiết bị quen thuộc)", data: { accessToken, refreshToken, mfaRequired: false } }
   */
  login: async (payload: LoginPayload) => {
    const deviceId = payload.deviceId ?? ensureDeviceId();
    const response = await axiosInstance.post<ApiResponse<TokenData | "">>("/auth/login", {
      email: payload.email,
      password: payload.password,
      deviceId,
    });

    const apiData = response.data;

    // Nếu data là string rỗng "" → thiết bị mới, cần OTP
    if (apiData.data === "" || !apiData.data || (typeof apiData.data === "string" && apiData.data === "")) {
      return {
        requiresOtp: true,
        message: apiData.message,
        deviceId,
      };
    }

    // Nếu có token data (object) → thiết bị quen, lưu token và email
    const tokenData = apiData.data as TokenData;
    saveTokens(tokenData, payload.email);

    return {
      requiresOtp: false,
      message: apiData.message,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      mfaRequired: tokenData.mfaRequired ?? false,
      deviceId,
    };
  },

  /**
   * 3️⃣ Xác thực OTP từ email
   * POST /auth/verify-otp
   * Response có 2 trường hợp:
   * - Chưa bật MFA: { status: 200, message: "...", data: { accessToken, refreshToken, mfaRequired: false } }
   * - Đã bật MFA: { status: 200, message: "...", data: { accessToken: null, refreshToken: null, mfaRequired: true } }
   */
  verifyOtp: async ({ email, otp, deviceId }: VerifyOtpPayload) => {
    const response = await axiosInstance.post<ApiResponse<TokenData>>("/auth/verify-otp", {
      email,
      otp,
      deviceId,
    });

    const tokenData = response.data.data;
    
    // Chỉ lưu token nếu không cần MFA (theo word.txt: nếu mfaRequired=true thì accessToken và refreshToken sẽ là null)
    if (tokenData.accessToken && tokenData.refreshToken && !tokenData.mfaRequired) {
      saveTokens(tokenData, email);
    }

    return {
      message: response.data.message,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      mfaRequired: tokenData.mfaRequired ?? false,
    };
  },

  /**
   * 4️⃣ Xác thực mã Google Authenticator (MFA)
   * POST /auth/mfa/verify
   * Body: { email, code: number }
   * Response: { status: 200, message: "Đăng nhập thành công (MFA)", data: { accessToken, refreshToken, mfaRequired: false } }
   */
  verifyMfa: async ({ email, code }: VerifyMfaPayload) => {
    const response = await axiosInstance.post<ApiResponse<TokenData>>("/auth/mfa/verify", {
      email,
      code, // Backend nhận code là number
    });

    const tokenData = response.data.data;
    saveTokens(tokenData, email);

    return {
      message: response.data.message,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      mfaRequired: tokenData.mfaRequired ?? false,
    };
  },

  /**
   * 5️⃣ Bật MFA cho user
   * POST /auth/mfa/enable?email=<email>
   * Response: { status: 200, message: "...", data: { secret: "...", qrBase64: "data:image/png;base64,..." } }
   */
  enableMfa: async (email: string) => {
    const response = await axiosInstance.post<ApiResponse<MfaEnableData>>(
      `/auth/mfa/enable?email=${encodeURIComponent(email)}`,
    );
    return response.data.data; // { secret, qrBase64 }
  },

  /**
   * 6️⃣ Làm mới Access Token bằng Refresh Token
   * POST /auth/refresh
   * Header: Authorization: Bearer <refresh_token>
   * Response: { status: 200, message: "...", data: "<new_access_token>" }
   */
  refresh: async (): Promise<string> => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error("Không có refresh token");
    }

    const response = await axiosInstance.post<ApiResponse<string>>(
      "/auth/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    );

    const newAccessToken = response.data.data;
    // Lưu access token mới (refresh token giữ nguyên)
    const currentRefreshToken = tokenStorage.getRefreshToken();
    if (currentRefreshToken) {
      tokenStorage.setTokens(newAccessToken, currentRefreshToken);
    }

    return newAccessToken;
  },

  /**
   * 7️⃣ Đăng xuất
   * POST /auth/logout
   * Header: Authorization: Bearer <access_token> hoặc email
   */
  logout: async (email?: string) => {
    const accessToken = tokenStorage.getAccessToken();
    const authHeader = accessToken ? `Bearer ${accessToken}` : email || "";

    await axiosInstance.post(
      "/auth/logout",
      {},
      {
        headers: {
          Authorization: authHeader,
        },
      },
    );

    tokenStorage.clear();
    // Xóa email khi logout
    localStorage.removeItem('user_email');
  },

  /**
   * 🔸 OAuth2: Đăng nhập bằng Google
   * Frontend chỉ cần redirect user tới URL này, backend sẽ xử lý và redirect về /oauth2/success
   */
  getGoogleOAuthUrl: () => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    return `${baseUrl.replace(/\/+$/, "")}/oauth2/authorization/google`;
  },

  /**
   * 🔸 Kiểm tra trạng thái MFA
   * Lưu ý: Endpoint /auth/mfa/status không tồn tại trong backend
   * Tạm thời trả về mfaEnabled = false
   */
  checkMfaStatus: async (email: string): Promise<{ mfaEnabled: boolean; remainingBackupCodes?: number }> => {
    // Endpoint /auth/mfa/status không tồn tại trong backend
    // Tạm thời trả về false, user có thể bật MFA thủ công
    return {
      mfaEnabled: false,
      remainingBackupCodes: 0,
    };
    // TODO: Backend cần thêm endpoint /auth/mfa/status
    // const response = await axiosInstance.get<ApiResponse<{ mfaEnabled: boolean; remainingBackupCodes?: number }>>(
    //   `/auth/mfa/status?email=${encodeURIComponent(email)}`
    // );
    // return response.data.data;
  },
};

export { ensureDeviceId, saveTokens, tokenStorage };
