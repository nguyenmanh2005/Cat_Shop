import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/authService";

interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
  }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    if (token) fetchUserProfile();
    else setIsLoading(false);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await authService.getProfile();
      if (res?.data) {
        const data = res.data;
        setUser({
          id: data.user_id,
          fullName: data.username,
          email: data.email,
          phone: data.phone,
          role: data.role_id === 1 ? "admin" : "user",
        });
      }
    } catch {
      authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authService.login({ email, password });

      const data = res.data; // ✅ backend trả về "data"

      // ✅ Lưu token
      authService.saveToken(data.accessToken);

      // ✅ Cập nhật state user
      setUser({
        id: data.user_id,
        fullName: data.username,
        email: data.email,
        phone: data.phone,
        role: data.role_id === 1 ? "admin" : "user",
      });

      return true;
    } catch (err) {
      console.error("Login error:", err);
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
      await authService.register({
        username: userData.fullName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        address: "",
      });
      return true;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
