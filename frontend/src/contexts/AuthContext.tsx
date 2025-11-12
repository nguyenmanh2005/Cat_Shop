import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/authService";
import { apiService } from "@/services/api";
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
        const userEmail = localStorage.getItem('user_email');
        if (authService.isAuthenticated() && userEmail) {
          // Nếu có token và email, lấy thông tin user từ API
          try {
            const userData = await authService.getProfile();
            // Xử lý cả snake_case và camelCase
            const userId = (userData as any).user_id || userData.userId;
            const roleId = (userData as any).role_id || userData.roleId;
            
            setUser({
              id: userId,
              fullName: userData.username || '',
              email: userData.email || '',
              phone: userData.phone || '',
              role: roleId === 1 ? 'admin' : 'user'
            });
          } catch (error) {
            // Nếu getProfile fail, thử lấy từ email
            const userData = await apiService.get<User>(`/users/email/${encodeURIComponent(userEmail)}`);
            const userId = (userData as any).user_id || userData.userId;
            const roleId = (userData as any).role_id || userData.roleId;
            
            setUser({
              id: userId,
              fullName: userData.username || '',
              email: userData.email || '',
              phone: userData.phone || '',
              role: roleId === 1 ? 'admin' : 'user'
            });
          }
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
      
      // Lấy thông tin user từ response hoặc từ profile API
      let userData: User;
      if (response.user) {
        userData = response.user;
      } else {
        // Nếu response không có user, lấy từ profile API
        userData = await authService.getProfile();
      }
      
      // Xử lý cả snake_case và camelCase
      const userId = (userData as any).user_id || userData.userId;
      const username = userData.username || '';
      const userEmail = userData.email || '';
      const userPhone = userData.phone || '';
      const roleId = (userData as any).role_id || userData.roleId;
      
      // Cập nhật user state
      setUser({
        id: userId,
        fullName: username,
        email: userEmail,
        phone: userPhone,
        role: roleId === 1 ? 'admin' : 'user'
      });
      
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      // Xóa token nếu có lỗi
      authService.logout();
      throw error; // Ném lại để component có thể xử lý
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
      
      // Backend không tự động đăng nhập sau khi đăng ký
      // User cần đăng nhập thủ công
      // Không cần set user state ở đây
      
      return true;
    } catch (error: any) {
      console.error("Register error:", error);
      throw error; // Ném lại để component có thể xử lý
    }
  };

  const loginWithOTP = async (email: string, otp: string, sessionId?: string): Promise<boolean> => {
    try {
      const response = await authService.verifyOTP(email, otp, sessionId);
      
      // Lấy thông tin user từ API
      const userData = await authService.getProfile();
      const userId = (userData as any).user_id || userData.userId;
      const roleId = (userData as any).role_id || userData.roleId;
      
      setUser({
        id: userId,
        fullName: userData.username || '',
        email: userData.email || '',
        phone: userData.phone || '',
        role: roleId === 1 ? 'admin' : 'user'
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
