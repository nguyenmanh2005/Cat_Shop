import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/authService";
import type { LoginRequest, RegisterRequest } from "@/services/authService";
import { User } from "@/types";

// Interface cho User trong AuthContext (tương thích với database schema)
interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithOTP: (email: string, otp: string, sessionId?: string) => Promise<boolean>;
  loginWithQR: (sessionId: string) => Promise<boolean>;
  register: (userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<boolean>;
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra thông tin đăng nhập từ token khi component mount
    const checkAuthStatus = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Nếu có token, lấy thông tin user từ API
          const userData = await authService.getProfile();
          setUser({
            id: userData.user_id,
            fullName: userData.username, // Sử dụng username làm fullName
            email: userData.email,
            phone: userData.phone,
            role: userData.role_id === 1 ? 'admin' : 'user' // Giả sử role_id = 1 là admin
          });
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        // Nếu lỗi, xóa token và logout
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password });
      
      // Cập nhật user state
      setUser({
        id: response.user.user_id,
        fullName: response.user.username,
        email: response.user.email,
        phone: response.user.phone,
        role: response.user.role_id === 1 ? 'admin' : 'user'
      });
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<boolean> => {
    try {
      const response = await authService.register({
        username: userData.fullName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        address: '' // Có thể thêm field này vào form
      });
      
      // Không tự động đăng nhập sau khi đăng ký
      return true;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  const loginWithOTP = async (email: string, otp: string, sessionId?: string): Promise<boolean> => {
    try {
      const response = await authService.verifyOTP(email, otp, sessionId);
      
      // Lấy thông tin user từ API
      const userData = await authService.getProfile();
      setUser({
        id: userData.user_id,
        fullName: userData.username,
        email: userData.email,
        phone: userData.phone,
        role: userData.role_id === 1 ? 'admin' : 'user'
      });
      
      return true;
    } catch (error) {
      console.error("OTP login error:", error);
      return false;
    }
  };

  const loginWithQR = async (sessionId: string): Promise<boolean> => {
    try {
      const response = await authService.verifyQRCode(sessionId);
      
      if (response) {
        // Lấy thông tin user từ API
        const userData = await authService.getProfile();
        setUser({
          id: userData.user_id,
          fullName: userData.username,
          email: userData.email,
          phone: userData.phone,
          role: userData.role_id === 1 ? 'admin' : 'user'
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("QR login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    loginWithOTP,
    loginWithQR,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
