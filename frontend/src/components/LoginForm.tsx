import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Shield, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onClose: () => void;
}

type LoginMode = "email" | "otp";

const LoginForm = ({ onSwitchToRegister, onClose }: LoginFormProps) => {
  const { login, loginWithOTP, pendingEmail } = useAuth();
  const { toast } = useToast();

  const [loginMode, setLoginMode] = useState<LoginMode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [lastCredentials, setLastCredentials] = useState<{ email: string; password: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (pendingEmail) {
      setOtpEmail(pendingEmail);
      setLoginMode("otp");
    }
  }, [pendingEmail]);

  const resetOtpState = () => {
    setOtp("");
  };

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
      const result = await login(email, password);

      if (result.success) {
        toast({
          title: "Đăng nhập thành công!",
          description: "Chào mừng bạn quay trở lại với Cham Pets",
        });
        onClose();
        return;
      }

      if (result.requiresOtp) {
        setLastCredentials({ email, password });
        setOtpEmail(email);
        resetOtpState();
        setLoginMode("otp");
        toast({
          title: "Yêu cầu OTP",
          description: result.message || "Vui lòng kiểm tra email để lấy mã OTP",
        });
      }
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

  const handleResendOtp = async () => {
    if (!lastCredentials) {
      toast({
        title: "Không thể gửi lại OTP",
        description: "Vui lòng đăng nhập lại bằng email và mật khẩu",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await login(lastCredentials.email, lastCredentials.password);
      if (result.requiresOtp) {
        toast({
          title: "OTP đã được gửi lại",
          description: result.message || "Vui lòng kiểm tra email của bạn",
        });
      } else if (result.success) {
        toast({
          title: "Đăng nhập thành công",
          description: "Thiết bị đã được xác minh",
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Lỗi gửi lại OTP",
        description: error.message || "Không thể gửi lại mã OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
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
      const result = await loginWithOTP(otpEmail, otp);

      if (result.success) {
        toast({
          title: "Đăng nhập thành công!",
          description: "Chào mừng bạn quay trở lại với Cham Pets",
        });
        onClose();
        return;
      }

      if (result.mfaRequired) {
        toast({
          title: "Yêu cầu MFA",
          description: result.message || "Vui lòng nhập mã Google Authenticator",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "OTP không chính xác",
        description: result.message || "Vui lòng kiểm tra lại mã OTP",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi xác thực",
        description: error.message || "Đã xảy ra lỗi khi xác thực OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabs = () => (
    <div className="flex items-center gap-2 border-b border-gray-200">
      <button
        type="button"
        onClick={() => setLoginMode("email")}
        className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
          loginMode === "email" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <Mail className="h-4 w-4 inline mr-2" />
        Email
      </button>
      <button
        type="button"
        onClick={() => setLoginMode("otp")}
        className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
          loginMode === "otp" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"
        }`}
        disabled={!otpEmail}
      >
        <Lock className="h-4 w-4 inline mr-2" />
        OTP
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 lg:p-12 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div className="my-8 flex items-center justify-center">
            <div className="relative">
              <div className="w-48 h-48 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                <Lock className="h-24 w-24 text-white" />
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-400/30 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl"></div>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">SECURE ACCESS</h2>
            <p className="text-blue-100 text-lg">
              {loginMode === "email" ? "Đăng nhập bằng Email & Mật khẩu" : "Nhập mã OTP được gửi tới email của bạn"}
            </p>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />
        </div>
      </div>

      <div className="p-8 lg:p-12 flex flex-col justify-center">
        <div className="space-y-6">
          {renderTabs()}

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
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
          )}

          {loginMode === "otp" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp-email">Email</Label>
                <Input
                  id="otp-email"
                  type="email"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Mã OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Nhập mã 6 chữ số"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.6rem]"
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleVerifyOtp} className="flex-1" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? "Đang xác thực..." : "Xác thực OTP"}
                </Button>
                <Button type="button" variant="outline" onClick={handleResendOtp} disabled={isLoading}>
                  Gửi lại OTP
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => {
                    setLoginMode("email");
                    resetOtpState();
                  }}
                >
                  Quay lại đăng nhập bằng email
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="link" className="p-0 h-auto text-sm">
              Quên mật khẩu?
            </Button>
            <Button variant="link" className="p-0 h-auto text-sm font-medium" onClick={onSwitchToRegister}>
              Tạo tài khoản
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
