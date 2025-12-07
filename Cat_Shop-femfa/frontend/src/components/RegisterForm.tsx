import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { calculatePasswordStrength, getStrengthLabel } from "@/utils/passwordStrength";
import GoogleReCaptcha from "./GoogleReCaptcha";
import { authService } from "@/services/authService";

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
  const [passwordStrength, setPasswordStrength] = useState(calculatePasswordStrength(""));
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  
  // Kiểm tra xem có site key được cấu hình không
  const hasRecaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY && 
                               import.meta.env.VITE_RECAPTCHA_SITE_KEY.trim() !== "";
  
  // OTP verification states
  const [step, setStep] = useState<"form" | "verifyOtp">("form");
  const [otp, setOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const otpCountdownRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer cho OTP (2 phút = 120 giây)
  useEffect(() => {
    if (otpCountdown > 0) {
      otpCountdownRef.current = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) {
            if (otpCountdownRef.current) {
              clearInterval(otpCountdownRef.current);
              otpCountdownRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (otpCountdownRef.current) {
        clearInterval(otpCountdownRef.current);
        otpCountdownRef.current = null;
      }
    }

    return () => {
      if (otpCountdownRef.current) {
        clearInterval(otpCountdownRef.current);
        otpCountdownRef.current = null;
      }
    };
  }, [otpCountdown]);

  // Redirect trực tiếp trong cùng tab để đăng ký Google
  const handleGoogleRegister = () => {
    const googleOAuthUrl = "http://localhost:8080/oauth2/authorization/google";
    // Redirect trong cùng tab thay vì mở popup
    window.location.href = googleOAuthUrl;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Tính độ mạnh mật khẩu khi password thay đổi
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
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

    // Chỉ yêu cầu captcha nếu có site key được cấu hình
    const hasRecaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY && 
                                 import.meta.env.VITE_RECAPTCHA_SITE_KEY.trim() !== "";
    
    if (hasRecaptchaSiteKey && !recaptchaToken) {
      toast({
        title: "Thiếu xác minh bảo mật",
        description: "Vui lòng hoàn thành captcha trước khi đăng ký.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Bước 1: Đăng ký tài khoản (backend tạo user)
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        captchaToken: recaptchaToken,
      });
      
      // Bước 2: Gửi OTP ĐĂNG KÝ để xác thực email (QUAN TRỌNG: phải thành công mới cho tiếp tục)
      try {
        await authService.sendRegisterOtp(formData.email);
        setOtpCountdown(120); // 2 phút
        toast({
          title: "Mã xác thực đăng ký đã được gửi",
          description: `Mã OTP đăng ký đã được gửi đến email ${formData.email}. Vui lòng kiểm tra hộp thư và nhập mã để kích hoạt tài khoản.`,
        });
        // Chỉ chuyển sang bước verify OTP nếu gửi OTP thành công
        setStep("verifyOtp");
      } catch (otpError: any) {
        // Nếu gửi OTP fail, hiện lỗi và KHÔNG cho tiếp tục
        // (User đã được tạo nhưng chưa verify - cần xử lý ở backend)
        toast({
          title: "Lỗi gửi mã xác thực đăng ký",
          description: otpError.message || "Không thể gửi mã OTP đăng ký. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
          variant: "destructive",
        });
        // KHÔNG chuyển sang bước verify, giữ nguyên ở form
        // User có thể thử lại bằng cách bấm "Gửi lại mã" sau
      }
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast({
        title: "Mã OTP không hợp lệ",
        description: "Vui lòng nhập mã 6 chữ số được gửi đến email của bạn.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingOtp(true);

    try {
      // Dùng OTP đăng ký riêng (khác với OTP đăng nhập)
      const result = await authService.verifyRegisterOtp(formData.email, otp);

      if (result.accessToken) {
        toast({
          title: "Đăng ký và xác thực thành công!",
          description: "Tài khoản của bạn đã được kích hoạt và đăng nhập thành công.",
        });
        onClose();
        window.location.reload();
        return;
      }

      toast({
        title: "Mã OTP đăng ký hợp lệ",
        description: "Vui lòng tiếp tục các bước xác thực bảo mật nếu được yêu cầu.",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Mã OTP đăng ký không chính xác hoặc đã hết hạn";
      toast({
        title: "Lỗi xác thực OTP đăng ký",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      // Dùng OTP đăng ký riêng
      await authService.sendRegisterOtp(formData.email);
      setOtpCountdown(120);
      setOtp("");
      toast({
        title: "Mã OTP đăng ký đã được gửi lại",
        description: "Vui lòng kiểm tra lại hộp thư email của bạn.",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi gửi lại mã đăng ký",
        description: error.message || "Không thể gửi lại mã OTP đăng ký. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          {step === "form" ? "Đăng ký" : "Xác thực tài khoản"}
        </CardTitle>
        <CardDescription>
          {step === "form"
            ? "Tạo tài khoản mới để trải nghiệm dịch vụ tốt nhất"
            : `Nhập mã OTP vừa được gửi đến email ${formData.email} để kích hoạt tài khoản`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "form" ? (
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
            {formData.password && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Độ mạnh mật khẩu:</span>
                  <span className={`font-medium ${passwordStrength.strength === "weak" ? "text-red-500" : passwordStrength.strength === "fair" ? "text-orange-500" : passwordStrength.strength === "good" ? "text-yellow-500" : "text-green-500"}`}>
                    {getStrengthLabel(passwordStrength.strength)}
                  </span>
                </div>
                <Progress 
                  value={passwordStrength.score} 
                  className={`h-2 ${passwordStrength.strength === "weak" ? "[&>div]:bg-red-500" : passwordStrength.strength === "fair" ? "[&>div]:bg-orange-500" : passwordStrength.strength === "good" ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`}
                />
                {passwordStrength.feedback.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
                    {passwordStrength.feedback.map((feedback, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-1">•</span>
                        <span>{feedback}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
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

          <GoogleReCaptcha
            onVerify={setRecaptchaToken}
            onExpire={() => setRecaptchaToken(null)}
            className="mt-2"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || (hasRecaptchaSiteKey && !recaptchaToken)}
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
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="register-otp">Mã xác thực (OTP)</Label>
              <Input
                id="register-otp"
                type="text"
                placeholder="Nhập mã 6 chữ số"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-[0.6rem] h-14 border-2 border-primary/40 focus:border-primary focus:ring-primary/30 font-mono"
                disabled={isVerifyingOtp}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Nếu không thấy email, vui lòng kiểm tra hộp thư rác (spam) hoặc thư mục quảng cáo.
              </p>
              {otpCountdown > 0 && (
                <p className="text-xs text-muted-foreground">
                  Mã còn hiệu lực trong: <span className="font-bold text-primary">{Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}</span>
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isVerifyingOtp || otp.length !== 6}
            >
              {isVerifyingOtp ? "Đang xác thực..." : "Xác thực & đăng nhập"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading || isVerifyingOtp}
              onClick={handleResendOtp}
            >
              {isLoading ? "Đang gửi..." : otpCountdown > 0 ? `Gửi lại (${Math.floor(otpCountdown / 60)}:${(otpCountdown % 60).toString().padStart(2, '0')})` : "Gửi lại mã"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={isVerifyingOtp}
              onClick={() => {
                setStep("form");
                setOtp("");
                setOtpCountdown(0);
              }}
            >
              Quay về chỉnh sửa thông tin đăng ký
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
