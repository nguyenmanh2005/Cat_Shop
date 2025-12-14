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
        title: "Email is required",
        description: "Please enter your email",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await authService.forgotPassword(email);
      toast({
        title: "OTP Sent",
        description: "Please check your email to get the password reset OTP code",
      });
      setStep("otp");
    } catch (error: any) {
      toast({
        title: "Error Sending OTP",
        description: error.message || "Unable to send password reset OTP code",
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
        title: "OTP is required",
        description: "Please enter the OTP code sent to your email",
        variant: "destructive",
      });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Invalid New Password",
        description: "New password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Confirmation Mismatch",
        description: "Please re-enter the same new password",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword(email, otp, newPassword);
      toast({
        title: "Password Reset Successful",
        description: "Please log in again with your new password",
      });
      onBack();
    } catch (error: any) {
      toast({
        title: "Password Reset Error",
        description: error.message || "Unable to reset password. Please try again.",
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
            <h2 className="text-3xl font-bold">FORGOT PASSWORD</h2>
            <p className="text-blue-100 text-lg">
              Enter your email to receive the password reset link
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
                <h3 className="text-2xl font-bold">Reset Password</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your registered email. We will send a password reset link to that email.
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
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      onInvalid={(e) => {
                        e.currentTarget.setCustomValidity("Please fill in this field");
                      }}
                      onInput={(e) => {
                        e.currentTarget.setCustomValidity("");
                      }}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send OTP Code"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Enter OTP & New Password</h3>
                <p className="text-sm text-muted-foreground">
                  OTP code has been sent to email <strong>{email}</strong>. Please enter the OTP code and new password.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    maxLength={6}
                    required
                    onInvalid={(e) => {
                      e.currentTarget.setCustomValidity("Please fill in this field");
                    }}
                    onInput={(e) => {
                      e.currentTarget.setCustomValidity("");
                    }}
                    disabled={isLoading}
                    className="text-center text-2xl tracking-[0.6rem]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewPassword(value);
                      setPasswordStrength(calculatePasswordStrength(value));
                    }}
                    required
                    onInvalid={(e) => {
                      e.currentTarget.setCustomValidity("Please fill in this field");
                    }}
                    onInput={(e) => {
                      e.currentTarget.setCustomValidity("");
                    }}
                    disabled={isLoading}
                  />
                  {newPassword && (
                    <div className="space-y-1.5 mt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Password strength:</span>
                        <span
                          className={`font-medium ${
                            passwordStrength.strength === "weak"
                              ? "text-red-500"
                              : passwordStrength.strength === "fair"
                              ? "text-blue-500"
                              : passwordStrength.strength === "good"
                              ? "text-blue-400"
                              : "text-blue-600"
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
                              ? "bg-blue-500"
                              : passwordStrength.strength === "good"
                              ? "bg-blue-400"
                              : "bg-blue-600"
                          }`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-0.5 mt-1 list-disc list-inside">
                        <li>At least 6 characters</li>
                        <li>Should include uppercase and lowercase letters</li>
                        <li>Should include numbers</li>
                        <li>Should include special characters (e.g., ! @ # $ %)</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    onInvalid={(e) => {
                      e.currentTarget.setCustomValidity("Please fill in this field");
                    }}
                    onInput={(e) => {
                      e.currentTarget.setCustomValidity("");
                    }}
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
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
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;

