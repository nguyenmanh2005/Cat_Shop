import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { calculatePasswordStrength, getStrengthLabel } from "@/utils/passwordStrength";

interface ForgotPasswordFormProps {
  onBack: () => void;
  onClose: () => void;
}

const ForgotPasswordForm = ({ onBack, onClose }: ForgotPasswordFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [passwordStrength, setPasswordStrength] = useState(
    calculatePasswordStrength("")
  );

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Email không được để trống",
        description: "Vui lòng nhập email của bạn",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await authService.forgotPassword(email);
      toast({
        title: "OTP đã được gửi",
        description: "Vui lòng kiểm tra email của bạn để lấy mã OTP đặt lại mật khẩu",
      });
      setStep("otp");
    } catch (error: any) {
      toast({
        title: "Lỗi gửi OTP",
        description: error.message || "Không thể gửi mã OTP đặt lại mật khẩu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      toast({
        title: "OTP không được để trống",
        description: "Vui lòng nhập mã OTP được gửi đến email của bạn",
        variant: "destructive",
      });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Mật khẩu mới không hợp lệ",
        description: "Mật khẩu mới phải có ít nhất 6 ký tự",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Xác nhận mật khẩu không khớp",
        description: "Vui lòng nhập lại mật khẩu mới giống nhau",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword(email, otp, newPassword);
      toast({
        title: "Đặt lại mật khẩu thành công",
        description: "Vui lòng đăng nhập lại với mật khẩu mới của bạn",
      });
      onBack();
    } catch (error: any) {
      toast({
        title: "Lỗi đặt lại mật khẩu",
        description: error.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                <Mail className="h-24 w-24 text-white" />
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-400/30 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl"></div>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">QUÊN MẬT KHẨU</h2>
            <p className="text-blue-100 text-lg">
              Nhập email của bạn để nhận link đặt lại mật khẩu
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
          {step === "email" ? (
            <>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Đặt lại mật khẩu</h3>
                <p className="text-sm text-muted-foreground">
                  Nhập email đã đăng ký của bạn. Chúng tôi sẽ gửi link đặt lại mật khẩu đến email đó.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="forgot-email"
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

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Nhập OTP & mật khẩu mới</h3>
                <p className="text-sm text-muted-foreground">
                  Mã OTP đã được gửi đến email <strong>{email}</strong>. Vui lòng nhập mã OTP và mật khẩu mới.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp">Mã OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Nhập mã 6 chữ số"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    maxLength={6}
                    required
                    disabled={isLoading}
                    className="text-center text-2xl tracking-[0.6rem]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewPassword(value);
                      setPasswordStrength(calculatePasswordStrength(value));
                    }}
                    required
                    disabled={isLoading}
                  />
                  {newPassword && (
                    <div className="space-y-1.5 mt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Độ mạnh mật khẩu:</span>
                        <span
                          className={`font-medium ${
                            passwordStrength.strength === "weak"
                              ? "text-red-500"
                              : passwordStrength.strength === "fair"
                              ? "text-orange-500"
                              : passwordStrength.strength === "good"
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          {getStrengthLabel(passwordStrength.strength)}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.strength === "weak"
                              ? "bg-red-500"
                              : passwordStrength.strength === "fair"
                              ? "bg-orange-500"
                              : passwordStrength.strength === "good"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-0.5 mt-1 list-disc list-inside">
                        <li>Ít nhất 6 ký tự</li>
                        <li>Nên có chữ cái in hoa và chữ thường</li>
                        <li>Nên có số</li>
                        <li>Nên có ký tự đặc biệt (ví dụ: ! @ # $ %)</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                </Button>
              </form>
            </>
          )}

          <div className="pt-4 border-t">
            <Button
              variant="link"
              className="p-0 h-auto text-sm flex items-center gap-2"
              onClick={onBack}
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại đăng nhập
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;

