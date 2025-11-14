import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";

interface ForgotPasswordFormProps {
  onBack: () => void;
  onClose: () => void;
}

const ForgotPasswordForm = ({ onBack, onClose }: ForgotPasswordFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      setEmailSent(true);
      toast({
        title: "Email đã được gửi",
        description: "Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi gửi email",
        description: error.message || "Không thể gửi email đặt lại mật khẩu",
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
          {!emailSent ? (
            <>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Đặt lại mật khẩu</h3>
                <p className="text-sm text-muted-foreground">
                  Nhập email đã đăng ký của bạn. Chúng tôi sẽ gửi link đặt lại mật khẩu đến email đó.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                  {isLoading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
                </Button>
              </form>
            </>
          ) : (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-10 w-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Email đã được gửi!</h3>
                <p className="text-sm text-muted-foreground">
                  Chúng tôi đã gửi link đặt lại mật khẩu đến <strong>{email}</strong>. 
                  Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn.
                </p>
              </div>
            </div>
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

