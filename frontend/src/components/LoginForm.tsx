import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Lock, Mail, QrCode, Shield, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { QRCodeSVG } from "qrcode.react";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onClose: () => void;
}

type LoginMode = "email" | "otp" | "qr";

const LoginForm = ({ onSwitchToRegister, onClose }: LoginFormProps) => {
  const { login, loginWithOTP, loginWithQR } = useAuth();
  const { toast } = useToast();
  
  // State cho login mode
  const [loginMode, setLoginMode] = useState<LoginMode>("email");
  
  // State cho Email/Password login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // State cho OTP login
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // State cho QR Code login
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [qrSessionId, setQrSessionId] = useState<string | null>(null);
  const [qrExpiresAt, setQrExpiresAt] = useState<number | null>(null);
  const [isCheckingQR, setIsCheckingQR] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const qrCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateQRCode = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await authService.generateQRCode();
      setQrCodeData(response.qrCode);
      setQrSessionId(response.sessionId);
      setQrExpiresAt(response.expiresAt);
    } catch (error) {
      toast({
        title: "Lỗi tạo QR code",
        description: "Không thể tạo QR code, vui lòng thử lại",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Reset state khi chuyển mode
  useEffect(() => {
    // Reset OTP state khi chuyển khỏi OTP mode
    if (loginMode !== "otp") {
      setOtpSent(false);
      setOtp("");
      setOtpEmail("");
      setOtpSessionId(null);
      setResendCooldown(0);
    }
    
    // Reset email/password khi chuyển khỏi email mode
    if (loginMode !== "email") {
      setEmail("");
      setPassword("");
    }
  }, [loginMode]);

  // Tạo QR code khi chuyển sang QR mode
  useEffect(() => {
    if (loginMode === "qr") {
      generateQRCode();
    } else {
      // Dừng polling khi chuyển sang mode khác
      if (qrCheckIntervalRef.current) {
        clearInterval(qrCheckIntervalRef.current);
        qrCheckIntervalRef.current = null;
      }
    }
    
    return () => {
      if (qrCheckIntervalRef.current) {
        clearInterval(qrCheckIntervalRef.current);
      }
    };
  }, [loginMode, generateQRCode]);

  // Polling để kiểm tra QR code đã được quét chưa
  useEffect(() => {
    if (loginMode === "qr" && qrSessionId && !isCheckingQR) {
      qrCheckIntervalRef.current = setInterval(async () => {
        if (qrExpiresAt && Date.now() > qrExpiresAt) {
          // QR code đã hết hạn
          if (qrCheckIntervalRef.current) {
            clearInterval(qrCheckIntervalRef.current);
          }
          toast({
            title: "QR Code đã hết hạn",
            description: "Vui lòng tạo QR code mới",
            variant: "destructive",
          });
          generateQRCode();
          return;
        }

        setIsCheckingQR(true);
        try {
          const success = await loginWithQR(qrSessionId);
          if (success) {
            // Đăng nhập thành công
            if (qrCheckIntervalRef.current) {
              clearInterval(qrCheckIntervalRef.current);
            }
            toast({
              title: "Đăng nhập thành công!",
              description: "Chào mừng bạn quay trở lại với Cham Pets",
            });
            onClose();
          }
        } catch (error) {
          // Chưa quét, tiếp tục polling
        } finally {
          setIsCheckingQR(false);
        }
      }, 2000); // Kiểm tra mỗi 2 giây
    }

    return () => {
      if (qrCheckIntervalRef.current) {
        clearInterval(qrCheckIntervalRef.current);
      }
    };
  }, [loginMode, qrSessionId, qrExpiresAt, isCheckingQR, loginWithQR, toast, onClose, generateQRCode]);

  // Countdown cho resend OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Thông tin không đầy đủ",
        description: "Vui lòng nhập email và mật khẩu",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      
      toast({
        title: "Đăng nhập thành công!",
        description: "Chào mừng bạn quay trở lại với Cham Pets",
      });
      onClose();
    } catch (error: any) {
      const errorMessage = error.message || "Email hoặc mật khẩu không chính xác";
      toast({
        title: "Đăng nhập thất bại",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!otpEmail || !emailRegex.test(otpEmail)) {
      toast({
        title: "Email không hợp lệ",
        description: "Vui lòng nhập email hợp lệ",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.sendOTP(otpEmail);
      setOtpSent(true);
      setOtpSessionId(response.sessionId || null);
      setResendCooldown(60); // 60 giây cooldown
      toast({
        title: "OTP đã được gửi",
        description: "Vui lòng kiểm tra email của bạn",
      });
    } catch (error) {
      toast({
        title: "Lỗi gửi OTP",
        description: "Không thể gửi OTP, vui lòng thử lại",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    await handleSendOTP();
  };

  const handleOtpChange = (value: string) => {
    // Chỉ giữ lại các chữ số
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(numericValue);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "OTP không hợp lệ",
        description: "Vui lòng nhập mã OTP 6 chữ số",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const success = await loginWithOTP(otpEmail, otp, otpSessionId || undefined);
      
      if (success) {
        toast({
          title: "Đăng nhập thành công!",
          description: "Chào mừng bạn quay trở lại với Cham Pets",
        });
        onClose();
      } else {
        toast({
          title: "Đăng nhập thất bại",
          description: "Mã OTP không chính xác",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi đăng nhập",
        description: "Đã xảy ra lỗi, vui lòng thử lại",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left Section - Secure Access */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 lg:p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            {/* Logo */}
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>

            {/* Illustration */}
            <div className="my-8 flex items-center justify-center">
              <div className="relative">
                <div className="w-48 h-48 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                  <Lock className="h-24 w-24 text-white" />
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-400/30 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl"></div>
              </div>
            </div>

            {/* Text */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">SECURE ACCESS</h2>
              <p className="text-blue-100 text-lg">
                {loginMode === "email" && "Login with Email & Password"}
                {loginMode === "otp" && "Login with OTP via Email"}
                {loginMode === "qr" && "Login with QR Code"}
              </p>
            </div>
          </div>

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div 
              className="absolute inset-0"
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="space-y-6">
            {/* Tabs để chọn phương thức đăng nhập */}
            <div className="flex items-center gap-2 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setLoginMode("email")}
                className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                  loginMode === "email"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMode("otp")}
                className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                  loginMode === "otp"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Lock className="h-4 w-4 inline mr-2" />
                OTP
              </button>
              <button
                type="button"
                onClick={() => setLoginMode("qr")}
                className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                  loginMode === "qr"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <QrCode className="h-4 w-4 inline mr-2" />
                QR Code
              </button>
            </div>

            {/* Email/Password Login Form */}
            {loginMode === "email" && (
              <form onSubmit={handleEmailPasswordLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Nhập email của bạn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      disabled={isLoading}
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

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </form>
            )}

            {/* OTP Login Form */}
            {loginMode === "otp" && (
              <div className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="otp-email">Email</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp-email"
                        type="email"
                        placeholder="Nhập email của bạn"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        className="pl-10"
                        disabled={isLoading || otpSent}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={otpSent ? handleResendOTP : handleSendOTP}
                      disabled={isLoading || resendCooldown > 0 || !otpEmail}
                      className="whitespace-nowrap"
                    >
                      {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : otpSent ? "Gửi lại OTP" : "Gửi OTP"}
                    </Button>
                  </div>
                </div>

                {/* OTP Input */}
                {otpSent && (
                  <div className="space-y-2">
                    <Label htmlFor="otp">Nhập mã OTP</Label>
                    <div className="flex gap-2">
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Nhập mã 6 chữ số"
                        value={otp}
                        onChange={(e) => handleOtpChange(e.target.value)}
                        maxLength={6}
                        className="flex-1 text-center text-2xl tracking-widest font-mono"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendOTP}
                        disabled={isLoading || resendCooldown > 0}
                        className="whitespace-nowrap"
                      >
                        {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : "Gửi lại OTP"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Verify OTP Button */}
                {otpSent && (
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={isLoading || !otp || otp.length !== 6}
                    className="w-full"
                  >
                    {isLoading ? "Đang xác thực..." : "Xác thực OTP"}
                  </Button>
                )}
              </div>
            )}

            {/* QR Code Login */}
            {loginMode === "qr" && (
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  {/* QR Code */}
                  {qrCodeData ? (
                    <div className="relative p-4 bg-white border-4 border-green-500 rounded-lg">
                      <QRCodeSVG value={qrCodeData} size={256} />
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-500"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-500"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-500"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-500"></div>
                    </div>
                  ) : (
                    <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-sm text-gray-500">Đang tạo QR code...</p>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 text-center">
                    Scan this QR Code with your
                  </p>
                  <Button
                    variant="link"
                    className="text-sm"
                    onClick={generateQRCode}
                    disabled={isLoading}
                  >
                    Having trouble scanning?
                  </Button>
                </div>
              </div>
            )}

            {/* Footer Links */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="link" className="p-0 h-auto text-sm">
                Forget Password?
              </Button>
              <Button
                variant="link"
                className="p-0 h-auto text-sm font-medium"
                onClick={onSwitchToRegister}
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default LoginForm;
