import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra thông tin đăng nhập từ localStorage khi component mount
    const checkAuthStatus = () => {
      try {
        const savedUser = localStorage.getItem("cham_pets_user");
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        localStorage.removeItem("cham_pets_user");
      } finally {
        setIsLoading(false);
      }
    };

    // Tạo admin user mặc định nếu chưa có
    const createDefaultAdmin = () => {
      const usersData = localStorage.getItem("cham_pets_users");
      const users = usersData ? JSON.parse(usersData) : [];
      
      const adminExists = users.find((u: any) => u.email === "admin@champets.com");
      if (!adminExists) {
        const defaultAdmin = {
          id: "admin-001",
          fullName: "Administrator",
          email: "admin@champets.com",
          phone: "0123456789",
          password: "admin123",
          role: "admin",
          createdAt: new Date().toISOString(),
        };
        users.push(defaultAdmin);
        localStorage.setItem("cham_pets_users", JSON.stringify(users));
      }
    };

    createDefaultAdmin();
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Lấy danh sách users từ localStorage
      const usersData = localStorage.getItem("cham_pets_users");
      const users = usersData ? JSON.parse(usersData) : [];

      // Tìm user với email và password tương ứng
      const foundUser = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (foundUser) {
        // Lưu thông tin user đã đăng nhập (không lưu password)
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem("cham_pets_user", JSON.stringify(userWithoutPassword));
        return true;
      }

      return false;
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
      // Lấy danh sách users hiện tại
      const usersData = localStorage.getItem("cham_pets_users");
      const users = usersData ? JSON.parse(usersData) : [];

      // Kiểm tra email đã tồn tại chưa
      const existingUser = users.find((u: any) => u.email === userData.email);
      if (existingUser) {
        return false; // Email đã tồn tại
      }

      // Tạo user mới
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        role: 'user' as const,
        createdAt: new Date().toISOString(),
      };

      // Thêm user mới vào danh sách
      users.push(newUser);
      localStorage.setItem("cham_pets_users", JSON.stringify(users));

      // Không tự động đăng nhập, chỉ trả về thành công
      return true;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cham_pets_user");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
