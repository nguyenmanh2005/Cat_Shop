import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, type LoginRequest, type RegisterRequest, type LoginResult, type TokenResponse } from "@/services/authService";
import type { UserProfile } from "@/types";

interface AuthUser {
  id?: number;
  fullName: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
}

interface LoginState extends LoginResult {}

interface OtpState {
  success: boolean;
  mfaRequired?: boolean;
  message?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  pendingEmail: string | null;
  login: (email: string, password: string) => Promise<LoginState>;
  loginWithOTP: (email: string, otp: string) => Promise<OtpState>;
  register: (userData: { fullName: string; email: string; phone: string; password: string }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const buildAuthUser = (profile: UserProfile | any, tokensInfo: { role?: string } | null): AuthUser => {
  const rawId = (profile as any)?.user_id ?? (profile as any)?.userId;
  const roleName = tokensInfo?.role?.toLowerCase() === "admin" ? "admin" : "user";
  return {
    id: typeof rawId === "number" ? rawId : undefined,
    fullName: profile?.username || profile?.fullName || profile?.email || "",
    email: profile?.email || "",
    phone: profile?.phone,
    role: roleName,
  };
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrateUser = async (email: string) => {
    const profile = await authService.getProfile(email);
    const tokenInfo = authService.parseAccessToken();
    const authUser = buildAuthUser(profile, tokenInfo);
    setUser(authUser);
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const tokenInfo = authService.parseAccessToken();
        const storedEmail = tokenInfo?.email || localStorage.getItem("user_email");
        if (authService.isAuthenticated() && storedEmail) {
          await hydrateUser(storedEmail);
        } else if (!authService.isAuthenticated()) {
          // Nếu không có token, clear user
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        await authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // Listen for storage changes (khi tokens được lưu từ OAuth)
    const handleStorageChange = async () => {
      // Check lại auth status khi có storage event
      try {
        const tokenInfo = authService.parseAccessToken();
        const storedEmail = tokenInfo?.email || localStorage.getItem("user_email");
        if (authService.isAuthenticated() && storedEmail) {
          // Hydrate user khi có tokens mới
          await hydrateUser(storedEmail);
        } else if (!authService.isAuthenticated()) {
          // Nếu không còn token, clear user
          setUser(null);
        }
      } catch (error) {
        console.error("Error handling storage change:", error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event (trigger từ LoginSuccess)
    window.addEventListener('auth-tokens-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-tokens-updated', handleStorageChange);
    };
  }, []); // Empty dependency - chỉ chạy một lần khi mount

  const login = async (email: string, password: string): Promise<LoginState> => {
    const credentials: LoginRequest = { email, password };
    const result = await authService.login(credentials);

    // QUAN TRỌNG: KHÔNG hydrate user ngay cả khi có token
    // Bắt buộc phải xác minh trước khi cho phép truy cập
    // Chỉ hydrate user sau khi xác minh thành công (OTP, QR, hoặc Google Authenticator)
    if (result.success && result.tokens?.accessToken) {
      // Không hydrate user ở đây - vẫn yêu cầu xác minh
      setPendingEmail(email);
      return {
        ...result,
        success: false,
        requiresOtp: true,
      };
    }

    if (result.requiresOtp) {
      setPendingEmail(email);
    }

    return result;
  };

  const register = async (userData: { fullName: string; email: string; phone: string; password: string }): Promise<boolean> => {
    const payload: RegisterRequest = {
      username: userData.fullName,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      address: "",
    };
    await authService.register(payload);
    return true;
  };

  const loginWithOTP = async (email: string, otp: string): Promise<OtpState> => {
    try {
      const tokens: TokenResponse = await authService.verifyOTP(email, otp);

      // Kiểm tra mfaRequired TRƯỚC - nếu có mfaRequired, OTP đã đúng nhưng cần thêm bước Google Authenticator
      if (tokens.mfaRequired) {
        return {
          success: false,
          mfaRequired: true,
          message: "OTP đã được xác minh thành công. Tài khoản của bạn đã bật xác minh 2 bước. Vui lòng nhập mã từ ứng dụng Google Authenticator",
        };
      }

      // Nếu có accessToken → OTP đúng, đăng nhập thành công
      if (tokens.accessToken) {
        // OTP đúng và không cần MFA → Đăng nhập thành công
        await hydrateUser(email);
        setPendingEmail(null);
        return { success: true };
      }

      // Không có accessToken và không có mfaRequired → OTP sai hoặc có lỗi
      // Backend sẽ trả về message lỗi cụ thể
      return { 
        success: false, 
        message: "Mã OTP không chính xác. Vui lòng kiểm tra lại mã đã được gửi đến email của bạn" 
      };
    } catch (error: any) {
      // Xử lý lỗi từ backend - verifyOTP đã throw Error với message rõ ràng
      const errorMessage = error?.message || error?.response?.data?.message || "Xác thực OTP thất bại";
      
      // Kiểm tra xem backend có trả về mfaRequired trong error response không
      const errorData = error?.response?.data;
      if (errorData && (errorData.mfaRequired || (errorData.data && errorData.data.mfaRequired))) {
        return {
          success: false,
          mfaRequired: true,
          message: errorMessage || "Tài khoản của bạn đã bật xác minh 2 bước. Vui lòng nhập mã từ ứng dụng Google Authenticator",
        };
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setPendingEmail(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    pendingEmail,
    login,
    loginWithOTP,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
