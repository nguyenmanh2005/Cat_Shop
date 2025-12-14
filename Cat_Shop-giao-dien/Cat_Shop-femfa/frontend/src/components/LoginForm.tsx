import { useEffect, useState, useRef, useLayoutEffect } from "react";
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
import gsap from "gsap";

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
  
  // Kiểm tra xem có site key được cấu hình không
  const hasRecaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY && 
                               import.meta.env.VITE_RECAPTCHA_SITE_KEY.trim() !== "";
  
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

  const animationScope = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!animationScope.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".login-panel", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.15
      });

      gsap.from(".login-highlight", {
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.4)",
        delay: 0.2
      });
    }, animationScope);

    return () => ctx.revert();
  }, []);

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

  // Tự động tạo QR code cho đăng nhập bằng mã QR (giống Discord/Zalo) khi mở màn đăng nhập chính
  useEffect(() => {
    if (!needsVerification && !qrCodeData && !isLoading) {
      // Không cần await, chỉ khởi động generate + polling
      handleGenerateQrCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsVerification]);

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
        title: "Incomplete Information",
        description: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }

    if (hasRecaptchaSiteKey && !recaptchaToken) {
      toast({
        title: "reCAPTCHA Verification",
        description: "Please verify reCAPTCHA to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await login(email, password, recaptchaToken);

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
        title: "Account Verification",
        description: result.message || "Please select a verification method to continue login",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Email or password is incorrect";
      toast({
        title: "Login Failed",
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
        title: "Invalid Email",
        description: "Please login again with email and password",
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
        title: "OTP Sent",
        description: "Please check your email for the OTP code. The code is valid for 2 minutes.",
      });
    } catch (error: unknown) {
      toast({
        title: "OTP Send Error",
        description: error instanceof Error ? error.message : "Unable to send OTP code",
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
    } catch (error: unknown) {
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
        title: "Invalid Phone Number",
        description: "Please enter phone number in correct format (e.g., 0912345678 or +84912345678)",
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
          title: "Phone Number Mismatch",
          description: `The phone number you entered does not match the registered phone number (${userPhoneNumber}). Please use the registered phone number or enter a new phone number.`,
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
        title: "OTP Sent",
        description: `OTP code has been sent to phone number ${cleanPhone}. The code is valid for 2 minutes.`,
      });
    } catch (error: unknown) {
      toast({
        title: "Error Sending OTP",
        description: error instanceof Error ? error.message : "Unable to send OTP code via SMS",
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
        title: "Invalid OTP",
        description: "Please enter 6-digit OTP code",
        variant: "destructive",
      });
      return;
    }

    if (!verificationEmail) {
      toast({
        title: "Invalid Email",
        description: "Please login again with email and password",
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
          title: "Login Successful!",
          description: "Welcome back to Cham Pets",
        });
        setNeedsVerification(false);
        setVerificationMethod(null);
        resetSmsOtpState();
        onClose();
        return;
      }

      // OTP từ SMS không chính xác
      toast({
        title: "Incorrect OTP Code",
        description: result.message || "Please check the OTP code sent to your phone number",
        variant: "destructive",
      });
    } catch (error: unknown) {
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "An error occurred while verifying SMS OTP",
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
      
    } catch (error: unknown) {
      toast({
        title: "QR Code Generation Error",
        description: error instanceof Error ? error.message : "Unable to generate QR code",
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
            title: "Login Successful!",
            description: "Welcome back to Cham Pets",
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
            title: "QR code has expired",
            description: "Please generate a new QR code",
            variant: "destructive",
          });
        }
        // PENDING: tiếp tục polling (không cần làm gì)
      } catch (error) {
        console.error("Error checking QR status:", error);
        // Continue polling on error - không dừng polling khi có lỗi network tạm thời
      }
    }, 10000); // Poll every 10 seconds (tăng từ 5s để giảm request và log spam)

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
        title: "Invalid OTP",
        description: "Please enter 6-digit OTP code",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await loginWithOTP(verificationEmail, otp);

      if (result.success) {
        toast({
          title: "Login Successful!",
          description: "Welcome back to Cham Pets",
        });
        setNeedsVerification(false);
        setVerificationMethod(null);
        onClose();
        return;
      }

      // OTP từ email không chính xác
      toast({
        title: "Incorrect OTP Code",
        description: result.message || "Please check the OTP code sent to your email",
        variant: "destructive",
      });
    } catch (error: unknown) {
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "An error occurred while verifying OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyGoogleAuthenticator = async () => {
    if (!googleAuthCode || googleAuthCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter 6-digit Google Authenticator code",
        variant: "destructive",
      });
      return;
    }

    if (!verificationEmail) {
      toast({
        title: "Invalid Email",
        description: "Please login again with email and password",
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
          title: "Login Successful!",
          description: "Welcome back to Cham Pets",
        });
        setNeedsVerification(false);
        setVerificationMethod(null);
        setGoogleAuthCode("");
        onClose();
        window.location.reload();
        return;
      }

      toast({
        title: "Incorrect Google Authenticator Code",
        description: "Please check the code from your Google Authenticator app",
        variant: "destructive",
      });
    } catch (error: unknown) {
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "An error occurred while verifying Google Authenticator",
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
        title: "Invalid Backup Code",
        description: "Please enter backup code in correct format (XXXX-XXXX)",
        variant: "destructive",
      });
      return;
    }

    if (!verificationEmail) {
      toast({
        title: "Invalid Email",
        description: "Please login again with email and password",
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
          title: "Login Successful!",
          description: "Backup code has been used and cannot be reused.",
        });
        setNeedsVerification(false);
        setVerificationMethod(null);
        setBackupCode("");
        onClose();
        window.location.reload();
        return;
      }

      toast({
        title: "Incorrect Backup Code",
        description: "Please check your backup code",
        variant: "destructive",
      });
    } catch (error: unknown) {
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "An error occurred while verifying backup code",
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
    <div
      ref={animationScope}
      className="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] max-w-[90vw] mx-auto w-full"
    >
      {/* Left Panel - Branding (thu nhỏ) */}
      <div className="login-panel bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 lg:p-8 flex flex-col justify-center text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center mb-4 shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="my-6 flex items-center justify-center">
            <div className="relative login-highlight">
              <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shadow-xl border border-white/20">
                <Lock className="h-16 w-16 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -top-3 -right-3 w-20 h-20 bg-blue-400/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute -bottom-3 -left-3 w-24 h-24 bg-indigo-500/30 rounded-full blur-2xl animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight drop-shadow-md">SECURE ACCESS</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              {!needsVerification
                ? "Login with Email & Password"
                : verificationMethod === "otp"
                ? "Enter OTP code sent to your email"
                : verificationMethod === "sms"
                ? "Enter OTP code sent to your phone"
                : verificationMethod === "qr"
                ? "Scan QR code to verify"
                : verificationMethod === "google-authenticator"
                ? "Enter code from Google Authenticator"
                : "Select verification method"}
            </p>
          </div>
        </div>
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="login-panel p-8 lg:p-10 flex flex-col justify-center bg-white text-gray-900">
        <div className="space-y-5">
          {!needsVerification ? (
            <>
              {/* Bước 1: Đăng nhập bằng email/password + QR song song (giống Discord) */}
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {/* Cột trái: Email + mật khẩu */}
                <div className="space-y-3 flex-1">
                  <form onSubmit={handleEmailPasswordLogin} className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-900">Email</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold text-gray-900">Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                          required
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-200"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="py-2">
                      <GoogleReCaptcha 
                        onVerify={setRecaptchaToken} 
                        onExpire={() => setRecaptchaToken(null)}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                      disabled={isLoading || (hasRecaptchaSiteKey && !recaptchaToken)}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>

                    <div className="flex items-center gap-3 text-xs font-medium uppercase text-gray-400 my-4">
                      <span className="h-px w-full bg-gray-300"></span>
                      <span>OR</span>
                      <span className="h-px w-full bg-gray-300"></span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98]"
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
                      <span>Login with Google</span>
                    </button>
                  </form>
                </div>

                {/* Cột phải: Đăng nhập bằng mã QR */}
                <div className="space-y-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 flex flex-col items-center justify-between backdrop-blur-sm shadow-inner flex-1">
                  <div className="text-center space-y-1 w-full">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <QrCode className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-bold text-gray-900">Login with QR Code</p>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed px-1">
                      
                    </p>
                  </div>

                  <div className="flex justify-center items-center p-3 bg-white rounded-lg shadow-md border border-gray-300 min-h-[180px] w-full">
                    {qrCodeData ? (
                      <div className="relative">
                        <img
                          src={`data:image/png;base64,${qrCodeData}`}
                          alt="Login QR Code"
                          className="w-40 h-40 rounded-lg shadow-sm"
                        />
                        <div className="absolute inset-0 rounded-lg border-2 border-blue-400/30 animate-pulse"></div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-xs text-gray-400 gap-2">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" />
                        <span className="font-medium">Generating QR code...</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-center w-full">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      onClick={handleGenerateQrCode}
                      className="w-full flex items-center justify-center gap-2 border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400 transition-all h-9 text-xs"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span className="font-semibold">Generate New QR Code</span>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : verificationMethod === null ? (
            <>
              {/* Bước 2: Chọn phương thức xác minh */}
              <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl font-bold text-gray-900">Account Verification</h3>
                <p className="text-sm text-gray-600">
                  Please select a verification method to continue login
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationMethod("otp");
                    setOtpSent(false);
                  }}
                  className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-gray-900 text-sm">Verify with Email OTP</h4>
                    <p className="text-xs text-gray-600 mt-0.5">Receive OTP code via email</p>
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
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all duration-200 ${
                    checkingPhone
                      ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-60"
                      : "border-gray-300 hover:border-blue-500 hover:bg-blue-50 active:scale-[0.98] shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm ${
                    checkingPhone ? "bg-gray-200" : "bg-gradient-to-br from-blue-600 to-blue-500"
                  }`}>
                    <Phone className={`h-6 w-6 ${
                      checkingPhone ? "text-gray-400" : "text-white"
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-gray-900 text-sm">Verify with SMS OTP</h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {checkingPhone 
                        ? "Checking..." 
                        : userPhoneNumber 
                        ? `Receive OTP code via SMS (${userPhoneNumber})` 
                        : "Receive OTP code via SMS"}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerificationMethod("google-authenticator");
                    setGoogleAuthCode("");
                  }}
                  className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                    <KeyRound className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-gray-900 text-sm">Verify with Google Authenticator</h4>
                    <p className="text-xs text-gray-600 mt-0.5">Enter code from Google Authenticator app</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerificationMethod("backup-code");
                    setBackupCode("");
                  }}
                  className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-gray-900 text-sm">Verify with Backup Code</h4>
                    <p className="text-xs text-gray-600 mt-0.5">Enter backup code (format: XXXX-XXXX)</p>
                  </div>
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleBackToLogin}
                className="w-full h-10 border-gray-300 hover:bg-gray-100 text-gray-900 font-semibold text-sm"
              >
                Back to Login
              </Button>
            </div>
            </>
          ) : verificationMethod === "otp" ? (
            <>
              {/* Bước 3a: Xác minh OTP */}
              <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-gray-900">Verify with Email OTP</h3>
                <p className="text-xs text-gray-600">
                  OTP code will be sent to: <strong className="text-gray-900">{verificationEmail}</strong>
                </p>
              </div>

              {!otpSent ? (
                <Button 
                  type="button" 
                  onClick={handleRequestOtp} 
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={isLoading}
                >
                  {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
                </Button>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="otp" className="text-sm font-semibold text-gray-900">OTP Code</Label>
                      {otpCountdown > 0 && (
                        <span className="text-sm text-gray-600">
                          Time remaining: <span className="font-bold text-blue-600">{Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}</span>
                        </span>
                      )}
                      {otpCountdown === 0 && otpSent && (
                        <span className="text-sm text-red-600 font-semibold">
                          OTP code has expired
                        </span>
                      )}
                    </div>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      maxLength={6}
                      className={`text-center text-2xl tracking-[0.6rem] h-14 border-2 bg-white text-gray-900 ${otpCountdown === 0 ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'} transition-all font-mono`}
                      disabled={isLoading}
                    />
                    {otpCountdown === 0 && otpSent && (
                      <p className="text-xs text-red-400 text-center bg-red-900/30 border border-red-800 p-2 rounded-lg">
                        ⚠️ OTP code has expired. Please resend a new code or try entering the current code (it may still be valid).
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleVerifyOtp} 
                      className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? "Đang xác thực..." : "Xác thực OTP"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleResendOtp} 
                      disabled={isLoading}
                      className="h-11 border-gray-700 hover:bg-gray-800 text-white font-semibold"
                    >
                      {otpCountdown > 0 ? `Resend (${Math.floor(otpCountdown / 60)}:${(otpCountdown % 60).toString().padStart(2, '0')})` : "Resend New Code"}
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
                className="w-full h-11 border-gray-300 hover:bg-gray-100 text-gray-900 font-semibold"
              >
                Choose Another Method
              </Button>
            </div>
            </>
          ) : verificationMethod === "sms" ? (
            <>
              {/* Bước 3b: Xác minh SMS OTP */}
              <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl font-bold text-gray-900">Verify with SMS OTP</h3>
                <p className="text-sm text-gray-600">
                  Enter phone number to receive OTP code via SMS
                </p>
              </div>

              {!smsOtpSent ? (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-900">Phone Number</Label>
                    <div className="relative group">
                      <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="Enter phone number (e.g., 0912345678)"
                        value={phoneNumber}
                        onChange={(e) => {
                          // Chỉ cho phép số và dấu +
                          const value = e.target.value.replace(/[^0-9+]/g, '');
                          setPhoneNumber(value);
                        }}
                        className="pl-10 h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                        disabled={isLoading}
                      />
                    </div>
                    {userPhoneNumber && (
                      <p className="text-xs text-gray-300 bg-gray-800 border border-gray-700 p-2 rounded-lg">
                        Registered phone number: <strong className="text-blue-400">{userPhoneNumber}</strong>
                      </p>
                    )}
                    {!userPhoneNumber && (
                      <p className="text-xs text-gray-400">
                        Enter phone number to receive OTP code via SMS
                      </p>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleRequestSmsOtp} 
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={isLoading || !phoneNumber}
                  >
                    {isLoading ? "Sending..." : "Send OTP Code"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="smsOtp" className="text-sm font-semibold text-gray-900">OTP Code</Label>
                      {smsOtpCountdown > 0 && (
                        <span className="text-sm text-gray-600">
                          Time remaining: <span className="font-bold text-blue-600">{Math.floor(smsOtpCountdown / 60)}:{(smsOtpCountdown % 60).toString().padStart(2, '0')}</span>
                        </span>
                      )}
                      {smsOtpCountdown === 0 && smsOtpSent && (
                        <span className="text-sm text-red-600 font-semibold">
                          OTP code has expired
                        </span>
                      )}
                    </div>
                    <Input
                      id="smsOtp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={smsOtp}
                      onChange={(e) => setSmsOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      maxLength={6}
                      className={`text-center text-2xl tracking-[0.6rem] h-14 border-2 bg-white text-gray-900 ${smsOtpCountdown === 0 ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'} transition-all font-mono`}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-300 text-center bg-gray-800 border border-gray-700 p-2 rounded-lg">
                      OTP code has been sent to: <strong className="text-blue-400">{phoneNumber}</strong>
                    </p>
                    {smsOtpCountdown === 0 && smsOtpSent && (
                      <p className="text-xs text-red-400 text-center bg-red-900/30 border border-red-800 p-2 rounded-lg">
                        ⚠️ OTP code has expired. Please resend a new code or try entering the current code (it may still be valid).
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleVerifySmsOtp} 
                      className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                      disabled={isLoading || smsOtp.length !== 6}
                    >
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleResendSmsOtp} 
                      disabled={isLoading}
                      className="h-11 border-gray-700 hover:bg-gray-800 text-white font-semibold"
                    >
                      {smsOtpCountdown > 0 ? `Resend (${Math.floor(smsOtpCountdown / 60)}:${(smsOtpCountdown % 60).toString().padStart(2, '0')})` : "Resend New Code"}
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
                className="w-full h-11 border-gray-300 hover:bg-gray-100 text-gray-900 font-semibold"
              >
                Choose Another Method
              </Button>
            </div>
            </>
          ) : verificationMethod === "qr" ? (
            <>
              {/* Bước 3b: Xác minh QR Code */}
              <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl font-bold text-gray-900">Verify with QR Code</h3>
                <p className="text-sm text-gray-600">
                  Scan QR code with mobile app to verify
                </p>
              </div>

              {qrCodeData ? (
                <div className="space-y-3">
                  <div className="flex justify-center p-4 bg-white rounded-xl border-2 border-gray-300">
                    <div className="relative">
                      <img 
                        src={`data:image/png;base64,${qrCodeData}`}
                        alt="QR Code"
                        className="w-56 h-56 rounded-lg shadow-md"
                      />
                      {qrStatus === "pending" && (
                        <div className="absolute inset-0 rounded-lg border-2 border-blue-400/50 animate-pulse"></div>
                      )}
                    </div>
                  </div>
                  <div className={`text-center p-4 rounded-xl ${
                    qrStatus === "pending" 
                      ? "bg-gray-800 border border-gray-700"
                      : qrStatus === "approved"
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-red-900/30 border border-red-800"
                  }`}>
                    <p className={`text-sm font-semibold ${
                      qrStatus === "pending" 
                        ? "text-blue-400"
                        : qrStatus === "approved"
                        ? "text-blue-400"
                        : "text-red-400"
                    }`}>
                      {qrStatus === "pending" 
                        ? "⏳ Scan QR code with mobile app to verify"
                        : qrStatus === "approved"
                        ? "✅ Verification successful!"
                        : "❌ QR code has expired. Please generate a new code."}
                    </p>
                    {qrStatus === "pending" && (
                      <p className="text-xs text-blue-400 mt-2">
                        Waiting for confirmation from mobile app...
                      </p>
                    )}
                  </div>
                  {qrStatus === "expired" && (
                    <Button
                      type="button"
                      onClick={handleGenerateQrCode}
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={isLoading}
                    >
                      Generate New QR Code
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={handleGenerateQrCode}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Generating..." : "Generate QR Code"}
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
                className="w-full h-11 border-gray-300 hover:bg-gray-100 text-gray-900 font-semibold"
              >
                Choose Another Method
              </Button>
            </div>
            </>
          ) : verificationMethod === "google-authenticator" ? (
            <>
              {/* Bước 3c: Xác minh Google Authenticator */}
              <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl font-bold text-gray-900">Verify with Google Authenticator</h3>
                <p className="text-sm text-gray-600">
                  Open Google Authenticator app and enter 6-digit code
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleAuthCode" className="text-sm font-semibold text-gray-900">Google Authenticator Code</Label>
                <Input
                  id="googleAuthCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={googleAuthCode}
                  onChange={(e) => setGoogleAuthCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.6rem] h-14 border-2 bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20 transition-all font-mono"
                  disabled={isLoading}
                />
              </div>

              <Button
                onClick={handleVerifyGoogleAuthenticator}
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading || googleAuthCode.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setVerificationMethod(null);
                  setGoogleAuthCode("");
                }}
                className="w-full h-11 border-gray-300 hover:bg-gray-100 text-gray-900 font-semibold"
              >
                Choose Another Method
              </Button>
            </div>
            </>
          ) : verificationMethod === "backup-code" ? (
            <>
              {/* Bước 3d: Xác minh Backup Code */}
              <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl font-bold text-gray-900">Verify with Backup Code</h3>
                <p className="text-sm text-gray-600">
                  Enter backup code (format: XXXX-XXXX)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupCode" className="text-sm font-semibold text-gray-900">Backup Code</Label>
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
                  className="text-center text-xl tracking-wider font-mono h-12 border-2 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-300 text-center bg-gray-800 border border-gray-700 p-2 rounded-lg">
                  Định dạng: 4 chữ cái/số - 4 chữ cái/số (ví dụ: ABCD-1234)
                </p>
              </div>

              <Button
                onClick={handleVerifyBackupCode}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading || !/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(backupCode.toUpperCase())}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setVerificationMethod(null);
                  setBackupCode("");
                }}
                className="w-full h-11 border-gray-300 hover:bg-gray-100 text-gray-900 font-semibold"
              >
                Choose Another Method
              </Button>
            </div>
            </>
          ) : null
          }

          {!needsVerification && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-700 mt-4">
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setShowForgotPassword(true)}
                type="button"
              >
                Forgot password?
              </Button>
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors" 
                onClick={onSwitchToRegister}
              >
                Create account
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
