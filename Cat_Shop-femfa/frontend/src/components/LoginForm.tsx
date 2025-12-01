import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Shield, Eye, EyeOff, QrCode, KeyRound, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { QRCodeSVG } from "qrcode.react";
import ForgotPasswordForm from "./ForgotPasswordForm";
import GoogleReCaptcha from "./GoogleReCaptcha";
import { ShieldCheck } from "lucide-react";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onClose: () => void;
}

type VerificationMethod = "otp" | "sms" | "qr" | "google-authenticator" | "backup-code" | null;

const LoginForm = ({ onSwitchToRegister, onClose }: LoginFormProps) => {
  const { login, loginWithOTP, pendingEmail } = useAuth();
  const { toast } = useToast();

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  
  // Verification states
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>(null);
  const [verificationEmail, setVerificationEmail] = useState("");
  
  // OTP states (Email)
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0); // Thời gian còn lại (giây)
  const otpCountdownRef = useRef<NodeJS.Timeout | null>(null);
  
  // SMS OTP states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsOtp, setSmsOtp] = useState("");
  const [smsOtpSent, setSmsOtpSent] = useState(false);
  const [smsOtpCountdown, setSmsOtpCountdown] = useState(0);
  const smsOtpCountdownRef = useRef<NodeJS.Timeout | null>(null);
  
  // QR Code states
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [qrSessionId, setQrSessionId] = useState<string>("");
  const [qrStatus, setQrStatus] = useState<"pending" | "approved" | "expired">("pending");
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Google Authenticator states
  const [googleAuthCode, setGoogleAuthCode] = useState<string>("");
  
  // Backup Code states
  const [backupCode, setBackupCode] = useState<string>("");
  
  // User phone number state (để check xem user đã đăng ký số điện thoại chưa)
  const [userPhoneNumber, setUserPhoneNumber] = useState<string | null>(null);
  const [checkingPhone, setCheckingPhone] = useState(false);

  // Redirect trực tiếp trong cùng tab để đăng nhập Google
  const handleGoogleLogin = () => {
    const googleOAuthUrl = "http://localhost:8080/oauth2/authorization/google";
    // Redirect trong cùng tab thay vì mở popup
    window.location.href = googleOAuthUrl;
  };

  useEffect(() => {
    if (pendingEmail) {
      setVerificationEmail(pendingEmail);
      setNeedsVerification(true);
      setOtpSent(false);
    }
  }, [pendingEmail]);

  // Cleanup polling khi component unmount hoặc chuyển tab
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    };
  }, []);

  // Cleanup polling khi chuyển khỏi QR mode
  useEffect(() => {
    if (verificationMethod !== "qr") {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    }
  }, [verificationMethod]);

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

  // Countdown timer cho SMS OTP (2 phút = 120 giây)
  useEffect(() => {
    if (smsOtpCountdown > 0) {
      smsOtpCountdownRef.current = setInterval(() => {
        setSmsOtpCountdown((prev) => {
          if (prev <= 1) {
            if (smsOtpCountdownRef.current) {
              clearInterval(smsOtpCountdownRef.current);
              smsOtpCountdownRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (smsOtpCountdownRef.current) {
        clearInterval(smsOtpCountdownRef.current);
        smsOtpCountdownRef.current = null;
      }
    }

    return () => {
      if (smsOtpCountdownRef.current) {
        clearInterval(smsOtpCountdownRef.current);
        smsOtpCountdownRef.current = null;
      }
    };
  }, [smsOtpCountdown]);

  const resetOtpState = () => {
    setOtp("");
    setOtpSent(false);
    setOtpCountdown(0);
    if (otpCountdownRef.current) {
      clearInterval(otpCountdownRef.current);
      otpCountdownRef.current = null;
    }
  };

  const resetSmsOtpState = () => {
    setSmsOtp("");
    setSmsOtpSent(false);
    setSmsOtpCountdown(0);
    setPhoneNumber("");
    if (smsOtpCountdownRef.current) {
      clearInterval(smsOtpCountdownRef.current);
      smsOtpCountdownRef.current = null;
    }
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

    if (!recaptchaToken) {
      toast({
        title: "Xác thực reCAPTCHA",
        description: "Vui lòng xác thực reCAPTCHA để tiếp tục",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await login(email, password);

      // LUÔN LUÔN yêu cầu xác minh sau khi đăng nhập email/password thành công
      // Đây là yêu cầu bảo mật - luôn cần xác minh 2 bước (OTP hoặc QR Code)
      // Ngay cả khi backend trả về success, vẫn phải qua bước xác minh
      
      // Kiểm tra số điện thoại của user - chỉ gọi nếu có token
      // Lưu ý: authService.login không lưu token, nên có thể không có token ở đây
      // Nếu không có token, checkUserPhoneNumber sẽ bị lỗi 401 nhưng đã được xử lý gracefully
      const hasToken = !!localStorage.getItem('access_token');
      if (hasToken) {
        await checkUserPhoneNumber(email);
      }
      
      if (result.success) {
        // Nếu backend đã lưu token, xóa đi để đảm bảo phải xác minh trước
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_email');
      }

      // Luôn chuyển sang màn hình xác minh
      setVerificationEmail(email);
      setNeedsVerification(true);
      setVerificationMethod(null); // Reset về màn hình chọn phương thức
      resetOtpState();
      
      toast({
        title: "Xác minh tài khoản",
        description: result.message || "Vui lòng chọn phương thức xác minh để tiếp tục đăng nhập",
      });
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

  const handleRequestOtp = async () => {
    if (!verificationEmail) {
      toast({
        title: "Email không hợp lệ",
        description: "Vui lòng đăng nhập lại bằng email và mật khẩu",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await authService.sendOtp(verificationEmail);
      setOtpSent(true);
      setOtpCountdown(120); // Bắt đầu countdown 2 phút (120 giây)
      toast({
        title: "OTP đã được gửi",
        description: "Vui lòng kiểm tra email của bạn để lấy mã OTP. Mã có hiệu lực trong 2 phút.",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi gửi OTP",
        description: error.message || "Không thể gửi mã OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    // Reset countdown và gửi lại OTP
    setOtpCountdown(0);
    if (otpCountdownRef.current) {
      clearInterval(otpCountdownRef.current);
      otpCountdownRef.current = null;
    }
    setOtp(""); // Xóa OTP cũ
    await handleRequestOtp();
  };

  // Kiểm tra số điện thoại của user
  const checkUserPhoneNumber = async (userEmail: string) => {
    try {
      setCheckingPhone(true);
      const profile = await authService.getProfile(userEmail);
      console.log("📱 LoginForm - User profile loaded:", profile);
      // Kiểm tra phone - có thể là null, undefined, hoặc empty string
      if (profile && profile.phone && profile.phone.trim() !== '') {
        setUserPhoneNumber(profile.phone);
        // Tự động set phone number nếu user đã có
        setPhoneNumber(profile.phone);
        console.log("✅ LoginForm - Phone number found:", profile.phone);
      } else {
        console.log("⚠️ LoginForm - No phone number found");
        setUserPhoneNumber(null);
        setPhoneNumber("");
      }
    } catch (error: any) {
      console.error("Error checking user phone:", error);
      // Nếu lỗi 401, có thể do chưa đăng nhập hoặc token hết hạn
      // Không cần hiển thị toast vì đây là trong quá trình đăng nhập
      setUserPhoneNumber(null);
      setPhoneNumber("");
    } finally {
      setCheckingPhone(false);
    }
  };

  const handleRequestSmsOtp = async () => {
    // Validate phone number format (Vietnamese format: 10 digits starting with 0, or +84)
    const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      toast({
        title: "Số điện thoại không hợp lệ",
        description: "Vui lòng nhập số điện thoại đúng định dạng (VD: 0912345678 hoặc +84912345678)",
        variant: "destructive",
      });
      return;
    }

    // Nếu user đã đăng ký số điện thoại, kiểm tra số nhập vào có khớp không
    if (userPhoneNumber) {
      const normalizedUserPhone = userPhoneNumber.replace(/\s+/g, '').replace(/^\+84/, '0');
      const normalizedInputPhone = cleanPhone.replace(/^\+84/, '0');
      
      if (normalizedInputPhone !== normalizedUserPhone) {
        toast({
          title: "Số điện thoại không khớp",
          description: `Số điện thoại bạn nhập không khớp với số điện thoại đã đăng ký (${userPhoneNumber}). Vui lòng sử dụng số điện thoại đã đăng ký hoặc nhập số điện thoại mới.`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setIsLoading(true);
      await authService.sendSmsOtp(cleanPhone);
      setSmsOtpSent(true);
      setSmsOtpCountdown(120); // Bắt đầu countdown 2 phút (120 giây)
      toast({
        title: "OTP đã được gửi",
        description: `Mã OTP đã được gửi đến số điện thoại ${cleanPhone}. Mã có hiệu lực trong 2 phút.`,
      });
    } catch (error: any) {
      toast({
        title: "Lỗi gửi OTP",
        description: error.message || "Không thể gửi mã OTP qua SMS",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendSmsOtp = async () => {
    // Reset countdown và gửi lại OTP
    setSmsOtpCountdown(0);
    if (smsOtpCountdownRef.current) {
      clearInterval(smsOtpCountdownRef.current);
      smsOtpCountdownRef.current = null;
    }
    setSmsOtp(""); // Xóa OTP cũ
    await handleRequestSmsOtp();
  };

  const handleVerifySmsOtp = async () => {
    if (!smsOtp || smsOtp.length !== 6) {
      toast({
        title: "OTP không hợp lệ",
        description: "Vui lòng nhập mã OTP 6 chữ số",
        variant: "destructive",
      });
      return;
    }

    if (!verificationEmail) {
      toast({
        title: "Email không hợp lệ",
        description: "Vui lòng đăng nhập lại bằng email và mật khẩu",
        variant: "destructive",
      });
      return;
    }

    const cleanPhone = phoneNumber.replace(/\s+/g, '');

    try {
      setIsLoading(true);
      const result = await authService.verifySmsOtp(verificationEmail, cleanPhone, smsOtp);

      if (result.success) {
        toast({
          title: "Đăng nhập thành công!",
          description: "Chào mừng bạn quay trở lại với Cham Pets",
        });
        setNeedsVerification(false);
        setVerificationMethod(null);
        resetSmsOtpState();
        onClose();
        return;
      }

      // OTP từ SMS không chính xác
      toast({
        title: "Mã OTP không chính xác",
        description: result.message || "Vui lòng kiểm tra lại mã OTP đã được gửi đến số điện thoại của bạn",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi xác thực",
        description: error.message || "Đã xảy ra lỗi khi xác thực OTP SMS",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQrCode = async () => {
    // Clear any existing polling first
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    try {
      setIsLoading(true);
      const response = await authService.generateQrCode();
      setQrCodeData(response.qrCodeBase64);
      setQrSessionId(response.sessionId);
      setQrStatus("pending");
      
      // Start polling for status
      startQrStatusPolling(response.sessionId);
      
      toast({
        title: "QR code đã được tạo",
        description: "Vui lòng quét mã bằng ứng dụng di động",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi tạo QR Code",
        description: error.message || "Không thể tạo mã QR",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startQrStatusPolling = (sessionId: string) => {
    // Clear any existing polling first
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await authService.checkQrStatus(sessionId);
        
        if (statusResponse.status === "APPROVED" && statusResponse.tokens) {
          // Clear polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          if (pollingTimeoutRef.current) {
            clearTimeout(pollingTimeoutRef.current);
            pollingTimeoutRef.current = null;
          }
          
          setQrStatus("approved");
          
          // Store tokens
          if (statusResponse.tokens.accessToken && statusResponse.tokens.refreshToken) {
            localStorage.setItem('access_token', statusResponse.tokens.accessToken);
            localStorage.setItem('refresh_token', statusResponse.tokens.refreshToken);
            if (verificationEmail) {
              localStorage.setItem('user_email', verificationEmail);
            }
          }
          
          toast({
            title: "Đăng nhập thành công!",
            description: "Chào mừng bạn quay trở lại với Cham Pets",
          });
          
          setNeedsVerification(false);
          setVerificationMethod(null);
          
          // Close modal and reload
          setTimeout(() => {
            onClose();
            window.location.reload();
          }, 1000);
        } else if (statusResponse.status === "EXPIRED" || statusResponse.status === "REJECTED") {
          // Clear polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          if (pollingTimeoutRef.current) {
            clearTimeout(pollingTimeoutRef.current);
            pollingTimeoutRef.current = null;
          }
          
          setQrStatus("expired");
          toast({
            title: "QR code đã hết hạn",
            description: "Vui lòng tạo mã QR mới",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking QR status:", error);
        // Continue polling on error
      }
    }, 5000); // Poll every 5 seconds (tối ưu để giảm request)

    pollingIntervalRef.current = pollInterval;

    // Stop polling after 5 minutes (QR code expiry)
    const timeout = setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setQrStatus((prevStatus) => {
        if (prevStatus === "pending") {
          return "expired";
        }
        return prevStatus;
      });
    }, 5 * 60 * 1000);

    pollingTimeoutRef.current = timeout;
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
      const result = await loginWithOTP(verificationEmail, otp);

      if (result.success) {
        toast({
          title: "Đăng nhập thành công!",
          description: "Chào mừng bạn quay trở lại với Cham Pets",
        });
        setNeedsVerification(false);
        setVerificationMethod(null);
        onClose();
        return;
      }

      // OTP từ email không chính xác
      toast({
        title: "Mã OTP không chính xác",
        description: result.message || "Vui lòng kiểm tra lại mã OTP đã được gửi đến email của bạn",
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

  const handleVerifyGoogleAuthenticator = async () => {
    if (!googleAuthCode || googleAuthCode.length !== 6) {
      toast({
        title: "Mã không hợp lệ",
        description: "Vui lòng nhập mã Google Authenticator 6 chữ số",
        variant: "destructive",
      });
      return;
    }

    if (!verificationEmail) {
      toast({
        title: "Email không hợp lệ",
        description: "Vui lòng đăng nhập lại bằng email và mật khẩu",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await authService.verifyGoogleAuthenticator(verificationEmail, googleAuthCode);

      if (result.accessToken && result.refreshToken) {
        // Lưu token
        localStorage.setItem('access_token', result.accessToken);
        localStorage.setItem('refresh_token', result.refreshToken);
        localStorage.setItem('user_email', verificationEmail);

        toast({
          title: "Đăng nhập thành công!",
          description: "Chào mừng bạn quay trở lại với Cham Pets",
        });
        setNeedsVerification(false);
        setVerificationMethod(null);
        setGoogleAuthCode("");
        onClose();
        window.location.reload();
        return;
      }

      toast({
        title: "Mã Google Authenticator không chính xác",
        description: "Vui lòng kiểm tra lại mã từ ứng dụng Google Authenticator",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi xác thực",
        description: error.message || "Đã xảy ra lỗi khi xác thực Google Authenticator",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyBackupCode = async () => {
    // Backup code format: XXXX-XXXX (8 ký tự + 1 dấu gạch ngang)
    if (!backupCode || !/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(backupCode.toUpperCase())) {
      toast({
        title: "Mã backup không hợp lệ",
        description: "Vui lòng nhập mã backup code đúng định dạng (XXXX-XXXX)",
        variant: "destructive",
      });
      return;
    }

    if (!verificationEmail) {
      toast({
        title: "Email không hợp lệ",
        description: "Vui lòng đăng nhập lại bằng email và mật khẩu",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await authService.verifyGoogleAuthenticator(verificationEmail, backupCode.toUpperCase());

      if (result.accessToken && result.refreshToken) {
        // Lưu token
        localStorage.setItem('access_token', result.accessToken);
        localStorage.setItem('refresh_token', result.refreshToken);
        localStorage.setItem('user_email', verificationEmail);

        toast({
          title: "Đăng nhập thành công!",
          description: "Backup code đã được sử dụng và không thể dùng lại.",
        });
        setNeedsVerification(false);
        setVerificationMethod(null);
        setBackupCode("");
        onClose();
        window.location.reload();
        return;
      }

      toast({
        title: "Mã backup không chính xác",
        description: "Vui lòng kiểm tra lại mã backup code",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi xác thực",
        description: error.message || "Đã xảy ra lỗi khi xác thực backup code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset về bước đăng nhập ban đầu
  const handleBackToLogin = () => {
    setNeedsVerification(false);
    setVerificationMethod(null);
    resetOtpState();
    resetSmsOtpState();
    setQrCodeData("");
    setQrStatus("pending");
    setGoogleAuthCode("");
    setBackupCode("");
    setRecaptchaToken(null);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  };

  // Hiển thị form quên mật khẩu
  if (showForgotPassword) {
    return (
      <ForgotPasswordForm
        onBack={() => setShowForgotPassword(false)}
        onClose={onClose}
      />
    );
  }

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
              {!needsVerification
                ? "Đăng nhập bằng Email & Mật khẩu"
                : verificationMethod === "otp"
                ? "Nhập mã OTP được gửi tới email của bạn"
                : verificationMethod === "sms"
                ? "Nhập mã OTP được gửi tới số điện thoại của bạn"
                : verificationMethod === "qr"
                ? "Quét mã QR để xác minh"
                : verificationMethod === "google-authenticator"
                ? "Nhập mã từ Google Authenticator"
                : "Chọn phương thức xác minh"}
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
          {!needsVerification ? (
            <>
              {/* Bước 1: Đăng nhập bằng email/password */}
              <div className="space-y-6">
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

                <GoogleReCaptcha 
                  onVerify={setRecaptchaToken} 
                  onExpire={() => setRecaptchaToken(null)}
                />

                <Button type="submit" className="w-full" disabled={isLoading || !recaptchaToken}>
                  {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </form>

              <div className="flex items-center gap-3 text-xs font-medium uppercase text-muted-foreground">
                <span className="h-px w-full bg-muted"></span>
                <span>Hoặc</span>
                <span className="h-px w-full bg-muted"></span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
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
                <span>Đăng nhập bằng Google</span>
              </button>
            </div>
            </>
          ) : verificationMethod === null ? (
            <>
              {/* Bước 2: Chọn phương thức xác minh */}
              <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Xác minh tài khoản</h3>
                <p className="text-sm text-muted-foreground">
                  Vui lòng chọn phương thức xác minh để tiếp tục đăng nhập
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationMethod("otp");
                    setOtpSent(false);
                  }}
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold">Xác minh bằng Email OTP</h4>
                    <p className="text-sm text-muted-foreground">Nhận mã OTP qua email</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerificationMethod("sms");
                    setSmsOtpSent(false);
                    // Tự động set số điện thoại nếu user đã đăng ký
                    if (userPhoneNumber) {
                      setPhoneNumber(userPhoneNumber);
                    } else {
                      setPhoneNumber(""); // Reset để người dùng nhập mới
                    }
                  }}
                  disabled={checkingPhone}
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg transition-colors ${
                    checkingPhone
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                      : "border-gray-200 hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    checkingPhone ? "bg-gray-100" : "bg-green-100"
                  }`}>
                    <Phone className={`h-6 w-6 ${
                      checkingPhone ? "text-gray-400" : "text-green-600"
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold">Xác minh bằng SMS OTP</h4>
                    <p className="text-sm text-muted-foreground">
                      {checkingPhone 
                        ? "Đang kiểm tra..." 
                        : userPhoneNumber 
                        ? `Nhận mã OTP qua tin nhắn SMS (${userPhoneNumber})` 
                        : "Nhận mã OTP qua tin nhắn SMS"}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerificationMethod("google-authenticator");
                    setGoogleAuthCode("");
                  }}
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <KeyRound className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold">Xác minh bằng Google Authenticator</h4>
                    <p className="text-sm text-muted-foreground">Nhập mã từ ứng dụng Google Authenticator</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerificationMethod("backup-code");
                    setBackupCode("");
                  }}
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold">Xác minh bằng Backup Code</h4>
                    <p className="text-sm text-muted-foreground">Nhập mã backup code (định dạng: XXXX-XXXX)</p>
                  </div>
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleBackToLogin}
                className="w-full"
              >
                Quay lại đăng nhập
              </Button>
            </div>
            </>
          ) : verificationMethod === "otp" ? (
            <>
              {/* Bước 3a: Xác minh OTP */}
              <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Xác minh bằng Email OTP</h3>
                <p className="text-sm text-muted-foreground">
                  Mã OTP sẽ được gửi đến: <strong>{verificationEmail}</strong>
                </p>
              </div>

              {!otpSent ? (
                <Button 
                  type="button" 
                  onClick={handleRequestOtp} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
                </Button>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="otp">Mã OTP</Label>
                      {otpCountdown > 0 && (
                        <span className="text-sm text-muted-foreground">
                          Còn lại: <span className="font-semibold text-primary">{Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}</span>
                        </span>
                      )}
                      {otpCountdown === 0 && otpSent && (
                        <span className="text-sm text-red-500 font-medium">
                          Mã OTP đã hết hạn
                        </span>
                      )}
                    </div>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Nhập mã 6 chữ số"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      maxLength={6}
                      className={`text-center text-2xl tracking-[0.6rem] ${otpCountdown === 0 ? 'border-red-300' : ''}`}
                      disabled={isLoading}
                    />
                    {otpCountdown === 0 && otpSent && (
                      <p className="text-xs text-red-500 text-center">
                        ⚠️ Mã OTP đã hết hạn. Vui lòng gửi lại mã mới hoặc thử nhập mã hiện tại (có thể vẫn còn hiệu lực).
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleVerifyOtp} 
                      className="flex-1" 
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? "Đang xác thực..." : "Xác thực OTP"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleResendOtp} 
                      disabled={isLoading}
                    >
                      {otpCountdown > 0 ? `Gửi lại (${Math.floor(otpCountdown / 60)}:${(otpCountdown % 60).toString().padStart(2, '0')})` : "Gửi lại mã mới"}
                    </Button>
                  </div>
                </>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setVerificationMethod(null);
                  resetOtpState();
                }}
                className="w-full"
              >
                Chọn phương thức khác
              </Button>
            </div>
            </>
          ) : verificationMethod === "sms" ? (
            <>
              {/* Bước 3b: Xác minh SMS OTP */}
              <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Xác minh bằng SMS OTP</h3>
                <p className="text-sm text-muted-foreground">
                  Nhập số điện thoại để nhận mã OTP qua tin nhắn SMS
                </p>
              </div>

              {!smsOtpSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="Nhập số điện thoại (VD: 0912345678)"
                        value={phoneNumber}
                        onChange={(e) => {
                          // Chỉ cho phép số và dấu +
                          const value = e.target.value.replace(/[^0-9+]/g, '');
                          setPhoneNumber(value);
                        }}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                    {userPhoneNumber && (
                      <p className="text-xs text-muted-foreground">
                        Số điện thoại đã đăng ký: <strong>{userPhoneNumber}</strong>
                      </p>
                    )}
                    {!userPhoneNumber && (
                      <p className="text-xs text-muted-foreground">
                        Nhập số điện thoại để nhận mã OTP qua SMS
                      </p>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleRequestSmsOtp} 
                    className="w-full" 
                    disabled={isLoading || !phoneNumber}
                  >
                    {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="smsOtp">Mã OTP</Label>
                      {smsOtpCountdown > 0 && (
                        <span className="text-sm text-muted-foreground">
                          Còn lại: <span className="font-semibold text-primary">{Math.floor(smsOtpCountdown / 60)}:{(smsOtpCountdown % 60).toString().padStart(2, '0')}</span>
                        </span>
                      )}
                      {smsOtpCountdown === 0 && smsOtpSent && (
                        <span className="text-sm text-red-500 font-medium">
                          Mã OTP đã hết hạn
                        </span>
                      )}
                    </div>
                    <Input
                      id="smsOtp"
                      type="text"
                      placeholder="Nhập mã 6 chữ số"
                      value={smsOtp}
                      onChange={(e) => setSmsOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      maxLength={6}
                      className={`text-center text-2xl tracking-[0.6rem] ${smsOtpCountdown === 0 ? 'border-red-300' : ''}`}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Mã OTP đã được gửi đến: <strong>{phoneNumber}</strong>
                    </p>
                    {smsOtpCountdown === 0 && smsOtpSent && (
                      <p className="text-xs text-red-500 text-center">
                        ⚠️ Mã OTP đã hết hạn. Vui lòng gửi lại mã mới hoặc thử nhập mã hiện tại (có thể vẫn còn hiệu lực).
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleVerifySmsOtp} 
                      className="flex-1" 
                      disabled={isLoading || smsOtp.length !== 6}
                    >
                      {isLoading ? "Đang xác thực..." : "Xác thực OTP"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleResendSmsOtp} 
                      disabled={isLoading}
                    >
                      {smsOtpCountdown > 0 ? `Gửi lại (${Math.floor(smsOtpCountdown / 60)}:${(smsOtpCountdown % 60).toString().padStart(2, '0')})` : "Gửi lại mã mới"}
                    </Button>
                  </div>
                </>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setVerificationMethod(null);
                  resetSmsOtpState();
                }}
                className="w-full"
              >
                Chọn phương thức khác
              </Button>
            </div>
            </>
          ) : verificationMethod === "qr" ? (
            <>
              {/* Bước 3b: Xác minh QR Code */}
              <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Xác minh bằng QR Code</h3>
                <p className="text-sm text-muted-foreground">
                  Quét mã QR bằng ứng dụng di động để xác minh
                </p>
              </div>

              {qrCodeData ? (
                <div className="space-y-4">
                  <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                    <img 
                      src={`data:image/png;base64,${qrCodeData}`}
                      alt="QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    {qrStatus === "pending" 
                      ? "Quét mã QR bằng ứng dụng di động để xác minh"
                      : qrStatus === "approved"
                      ? "✅ Xác minh thành công!"
                      : "❌ QR code đã hết hạn. Vui lòng tạo mã mới."}
                  </p>
                  {qrStatus === "pending" && (
                    <p className="text-xs text-center text-muted-foreground">
                      Đang chờ xác nhận từ ứng dụng di động...
                    </p>
                  )}
                  {qrStatus === "expired" && (
                    <Button
                      type="button"
                      onClick={handleGenerateQrCode}
                      className="w-full"
                      disabled={isLoading}
                    >
                      Tạo mã QR mới
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={handleGenerateQrCode}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang tạo..." : "Tạo mã QR"}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setVerificationMethod(null);
                  setQrCodeData("");
                  setQrStatus("pending");
                  if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                  }
                  if (pollingTimeoutRef.current) {
                    clearTimeout(pollingTimeoutRef.current);
                    pollingTimeoutRef.current = null;
                  }
                }}
                className="w-full"
              >
                Chọn phương thức khác
              </Button>
            </div>
            </>
          ) : verificationMethod === "google-authenticator" ? (
            <>
              {/* Bước 3c: Xác minh Google Authenticator */}
              <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Xác minh bằng Google Authenticator</h3>
                <p className="text-sm text-muted-foreground">
                  Mở ứng dụng Google Authenticator và nhập mã 6 chữ số
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleAuthCode">Mã Google Authenticator</Label>
                <Input
                  id="googleAuthCode"
                  type="text"
                  placeholder="Nhập mã 6 chữ số"
                  value={googleAuthCode}
                  onChange={(e) => setGoogleAuthCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.6rem]"
                  disabled={isLoading}
                />
              </div>

              <Button
                onClick={handleVerifyGoogleAuthenticator}
                className="w-full"
                disabled={isLoading || googleAuthCode.length !== 6}
              >
                {isLoading ? "Đang xác thực..." : "Xác thực"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setVerificationMethod(null);
                  setGoogleAuthCode("");
                }}
                className="w-full"
              >
                Chọn phương thức khác
              </Button>
            </div>
            </>
          ) : verificationMethod === "backup-code" ? (
            <>
              {/* Bước 3d: Xác minh Backup Code */}
              <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Xác minh bằng Backup Code</h3>
                <p className="text-sm text-muted-foreground">
                  Nhập mã backup code (định dạng: XXXX-XXXX)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupCode">Mã Backup Code</Label>
                <Input
                  id="backupCode"
                  type="text"
                  placeholder="XXXX-XXXX"
                  value={backupCode}
                  onChange={(e) => {
                    // Chỉ cho phép chữ cái in hoa, số và dấu gạch ngang
                    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                    // Tự động thêm dấu gạch ngang sau 4 ký tự
                    if (value.length > 4 && value[4] !== '-') {
                      value = value.slice(0, 4) + '-' + value.slice(4);
                    }
                    // Giới hạn độ dài: XXXX-XXXX (9 ký tự)
                    value = value.slice(0, 9);
                    setBackupCode(value);
                  }}
                  maxLength={9}
                  className="text-center text-xl tracking-wider font-mono"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Định dạng: 4 chữ cái/số - 4 chữ cái/số (ví dụ: ABCD-1234)
                </p>
              </div>

              <Button
                onClick={handleVerifyBackupCode}
                className="w-full"
                disabled={isLoading || !/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(backupCode.toUpperCase())}
              >
                {isLoading ? "Đang xác thực..." : "Xác thực"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setVerificationMethod(null);
                  setBackupCode("");
                }}
                className="w-full"
              >
                Chọn phương thức khác
              </Button>
            </div>
            </>
          ) : null
          }

          {!needsVerification && (
            <div className="flex items-center justify-between pt-4 border-t">
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm"
                onClick={() => setShowForgotPassword(true)}
                type="button"
              >
                Quên mật khẩu?
              </Button>
              <Button variant="link" className="p-0 h-auto text-sm font-medium" onClick={onSwitchToRegister}>
                Tạo tài khoản
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
