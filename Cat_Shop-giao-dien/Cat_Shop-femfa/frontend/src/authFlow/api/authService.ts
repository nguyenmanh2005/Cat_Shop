import { v4 as uuidv4 } from "uuid";
import axiosInstance, { tokenStorage } from "./axiosConfig";

export type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  captchaToken?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
  deviceId?: string;
  captchaToken?: string;
};

export type VerifyOtpPayload = {
  email: string;
  otp: string;
  deviceId: string;
};

export type VerifyMfaPayload = {
  email: string;
  code: string;
  deviceId?: string;
};

export type EnableMfaResponse = {
  qrBase64: string;
  backupCodes?: string[];
  backupCodesCount?: number;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = {
  message?: string;
  mfaRequired?: boolean;
} & Partial<AuthTokens>;

// Đảm bảo mỗi trình duyệt có một deviceId cố định
const ensureDeviceId = (): string => {
  const existing = tokenStorage.getDeviceId();
  if (existing) return existing;
  const newDeviceId = uuidv4();
  tokenStorage.setDeviceId(newDeviceId);
  return newDeviceId;
};

// Lưu token khi backend trả về
const saveTokens = (tokens?: Partial<AuthTokens>) => {
  if (tokens?.accessToken && tokens?.refreshToken) {
    tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
  }
};

export const authService = {
  register: async (payload: RegisterPayload) => {
    const { data } = await axiosInstance.post("/auth/register", {
      ...payload,
      // Yêu cầu backend KHÔNG gửi email link kích hoạt, chỉ tạo user (sẽ gửi OTP riêng sau)
      skipEmailVerification: true,
      useOtpVerification: true,
    });
    return data as { message: string };
  },
  login: async (payload: LoginPayload) => {
    const deviceId = payload.deviceId ?? ensureDeviceId();
    const { data } = await axiosInstance.post<AuthResponse>("/auth/login", {
      ...payload,
      deviceId,
    });
    saveTokens(data);
    return { ...data, deviceId };
  },
  verifyOtp: async ({ email, otp, deviceId }: VerifyOtpPayload) => {
    const { data } = await axiosInstance.post<AuthResponse>("/auth/verify-otp", {
      email,
      otp,
      deviceId,
    });
    saveTokens(data);
    return data;
  },
  verifyMfa: async ({ email, code, deviceId }: VerifyMfaPayload) => {
    const finalDeviceId = deviceId ?? ensureDeviceId();
    const { data } = await axiosInstance.post<AuthResponse>("/auth/mfa/verify", {
      email,
      code,
      deviceId: finalDeviceId,
    });
    saveTokens(data);
    return data;
  },
  enableMfa: async (email: string) => {
    const { data } = await axiosInstance.post<EnableMfaResponse>("/auth/mfa/enable", null, {
      params: { email },
    });
    return data;
  },
  checkMfaStatus: async (email: string) => {
    const { data } = await axiosInstance.get<{ mfaEnabled: boolean; remainingBackupCodes?: number }>("/auth/mfa/status", {
      params: { email },
    });
    return data;
  },
  sendOtp: async (email: string) => {
    const { data } = await axiosInstance.post("/auth/send-otp", { email });
    return data;
  },
  // OTP đăng ký (tách riêng với OTP đăng nhập)
  // Tạm thời dùng endpoint chung /auth/send-otp cho đến khi backend implement /auth/register/send-otp
  sendRegisterOtp: async (email: string) => {
    try {
      // Thử dùng endpoint riêng trước, nếu 404 thì fallback về endpoint chung
      try {
        const { data } = await axiosInstance.post("/auth/register/send-otp", { email });
        return data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.warn('Register OTP endpoint not found, using common OTP endpoint');
          const { data } = await axiosInstance.post("/auth/send-otp", { email });
          return data;
        }
        throw error;
      }
    } catch (error: any) {
      throw error;
    }
  },
  verifyRegisterOtp: async ({ email, otp, deviceId }: VerifyOtpPayload) => {
    try {
      // Thử dùng endpoint riêng trước, nếu 404 thì fallback về endpoint chung
      try {
        const { data } = await axiosInstance.post<AuthResponse>("/auth/register/verify-otp", {
          email,
          otp,
          deviceId,
        });
        saveTokens(data);
        return data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.warn('Register verify OTP endpoint not found, using common OTP endpoint');
          const { data } = await axiosInstance.post<AuthResponse>("/auth/verify-otp", {
            email,
            otp,
            deviceId,
          });
          saveTokens(data);
          return data;
        }
        throw error;
      }
    } catch (error: any) {
      throw error;
    }
  },
  generateBackupCodes: async (email: string) => {
    const { data } = await axiosInstance.post<{ backupCodes: string[]; count: number; message: string }>(
      "/auth/mfa/backup-codes/generate",
      null,
      { params: { email } }
    );
    return data;
  },
  regenerateBackupCodes: async (email: string) => {
    const { data } = await axiosInstance.post<{ backupCodes: string[]; count: number; message: string }>(
      "/auth/mfa/backup-codes/regenerate",
      null,
      { params: { email } }
    );
    return data;
  },
  getBackupCodesCount: async (email: string) => {
    const { data } = await axiosInstance.get<{ remainingCount: number }>("/auth/mfa/backup-codes/count", {
      params: { email },
    });
    return data;
  },
  logout: async () => {
    await axiosInstance.post("/auth/logout");
    tokenStorage.clear();
  },
};

export { ensureDeviceId, saveTokens, tokenStorage };

