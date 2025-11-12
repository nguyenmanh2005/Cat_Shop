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
  }, []);

  const login = async (email: string, password: string): Promise<LoginState> => {
    const credentials: LoginRequest = { email, password };
    const result = await authService.login(credentials);

    if (result.success && result.tokens?.accessToken) {
      await hydrateUser(email);
      setPendingEmail(null);
      return result;
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

      if (tokens.mfaRequired) {
        return {
          success: false,
          mfaRequired: true,
          message: "Yêu cầu mã Google Authenticator",
        };
      }

      if (tokens.accessToken) {
        await hydrateUser(email);
        setPendingEmail(null);
        return { success: true };
      }

      return { success: false, message: "OTP không hợp lệ" };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || error?.message || "Xác thực OTP thất bại",
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
