import { v4 as uuidv4 } from "uuid";
import axiosInstance, { tokenStorage } from "./axiosConfig";

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
  code: string;
};

export type EnableMfaResponse = {
  qrBase64: string;
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
    const { data } = await axiosInstance.post("/auth/register", payload);
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
  verifyMfa: async ({ email, code }: VerifyMfaPayload) => {
    const { data } = await axiosInstance.post<AuthResponse>("/auth/mfa/verify", {
      email,
      code,
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
    const { data } = await axiosInstance.get<{ mfaEnabled: boolean }>("/auth/mfa/status", {
      params: { email },
    });
    return data;
  },
  sendOtp: async (email: string) => {
    const { data } = await axiosInstance.post("/auth/send-otp", { email });
    return data;
  },
  logout: async () => {
    await axiosInstance.post("/auth/logout");
    tokenStorage.clear();
  },
};

export { ensureDeviceId, saveTokens, tokenStorage };

