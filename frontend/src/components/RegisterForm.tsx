import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onClose: () => void;
}

const RegisterForm = ({ onSwitchToLogin, onClose }: RegisterFormProps) => {
  const { register } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const popupCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval khi component unmount
  useEffect(() => {
    return () => {
      if (popupCheckIntervalRef.current) {
        clearInterval(popupCheckIntervalRef.current);
        popupCheckIntervalRef.current = null;
      }
    };
  }, []);

  // Mở popup đăng ký Google thông qua OAuth2 backend
  // Theo word.txt: Backend redirect về http://localhost:3000/oauth2/success
  // Lưu ý: Backend cần config redirect về http://localhost:5173/oauth2/success (port của Vite dev server)
  const handleGoogleRegister = () => {
    const googleOAuthUrl = "http://localhost:8080/oauth2/authorization/google";
    // Dùng full redirect để tránh vấn đề cross-origin
    // Backend sẽ redirect về /oauth2/success với query params (accessToken, refreshToken, mfaEnabled, qrBase64)
    window.location.href = googleOAuthUrl;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Lỗi xác nhận mật khẩu",
        description: "Mật khẩu xác nhận không khớp!",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      
      toast({
        title: "Đăng ký thành công!",
        description: "Tài khoản của bạn đã được tạo thành công",
      });
      // Chuyển sang form đăng nhập hoặc đóng modal nếu đã tự động đăng nhập
      onSwitchToLogin();
    } catch (error: any) {
      const errorMessage = error.message || "Đã xảy ra lỗi, vui lòng thử lại";
      toast({
        title: "Đăng ký thất bại",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">Đăng ký</CardTitle>
        <CardDescription>
          Tạo tài khoản mới để trải nghiệm dịch vụ tốt nhất
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Nhập họ và tên"
                value={formData.fullName}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="terms"
              type="checkbox"
              className="rounded border-gray-300"
              required
            />
            <Label htmlFor="terms" className="text-sm">
              Tôi đồng ý với{" "}
              <Button variant="link" className="p-0 h-auto text-sm">
                Điều khoản sử dụng
              </Button>{" "}
              và{" "}
              <Button variant="link" className="p-0 h-auto text-sm">
                Chính sách bảo mật
              </Button>
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
          </Button>

          <div className="flex items-center gap-3 text-xs font-medium uppercase text-muted-foreground">
            <span className="h-px w-full bg-muted"></span>
            <span>Hoặc</span>
            <span className="h-px w-full bg-muted"></span>
          </div>

          <button
            type="button"
            onClick={handleGoogleRegister}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:shadow-md"
          >
            <svg aria-hidden="true" focusable="false" className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.6 2.8-3.9 2.8-6.6 0-.6-.1-1.2-.2-1.8H12z"
              />
              <path
                fill="#34A853"
                d="M6.6 14.3l-.9.7-2.5 1.9C5.1 19.7 8.3 21.6 12 21.6c3 0 5.5-1 7.3-2.7l-3.1-2.4c-.9.6-2 .9-3.2.9-2.4 0-4.4-1.6-5.1-3.8z"
              />
              <path
                fill="#4A90E2"
                d="M3.2 6.9 5.7 8.8c.7-2.2 2.7-3.7 5.1-3.7 1.5 0 2.8.5 3.8 1.4l2.8-2.8C15.9 2 14 1.2 12 1.2 8.3 1.2 5.1 3 3.2 6.9z"
              />
              <path
                fill="#FBBC05"
                d="M12 3.6c-2.4 0-4.4 1.5-5.1 3.7l-2.5-1.9C5.1 3 8.3 1.2 12 1.2c2 0 3.9.8 5.3 2.3l-2.8 2.8c-1-.9-2.3-1.4-3.8-1.4z"
              />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            <span>Đăng ký bằng Google</span>
          </button>

          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
            </span>
            <Button
              variant="link"
              className="p-0 h-auto text-sm font-medium"
              onClick={onSwitchToLogin}
            >
              Đăng nhập ngay
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
