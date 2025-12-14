import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authService, ensureDeviceId } from "../api/authService";
import type { RegisterPayload } from "../api/authService";
import GoogleReCaptcha from "@/components/GoogleReCaptcha";
import ErrorAlert from "./ErrorAlert";
import { calculatePasswordStrength, getStrengthLabel } from "@/utils/passwordStrength";

type RegisterFormValues = RegisterPayload;

const RegisterForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormValues>();
  const [error, setError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const password = watch("password");
  const passwordStrength = calculatePasswordStrength(password || "");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  
  // Kiểm tra xem có site key được cấu hình không
  const hasRecaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY && 
                               import.meta.env.VITE_RECAPTCHA_SITE_KEY.trim() !== "";
  
  // OTP verification states
  const [step, setStep] = useState<"form" | "verifyOtp">("form");
  const [otp, setOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");
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

  // Xử lý gửi form đăng ký lên server
  const onSubmit = async (formValues: RegisterFormValues) => {
    // Chỉ yêu cầu captcha nếu có site key được cấu hình
    const hasRecaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY && 
                                 import.meta.env.VITE_RECAPTCHA_SITE_KEY.trim() !== "";
    
    if (hasRecaptchaSiteKey && !recaptchaToken) {
      setError("Please verify reCAPTCHA to continue");
      return;
    }

    try {
      setError(undefined);
      setSuccessMessage(undefined);
      
      // Bước 1: Đăng ký tài khoản (backend tạo user)
      await authService.register({
        ...formValues,
        captchaToken: recaptchaToken,
      });
      
      // Bước 2: Gửi OTP đăng ký để xác thực email
      try {
        await authService.sendRegisterOtp(formValues.email);
        setRegisteredEmail(formValues.email);
        setOtpCountdown(120); // 2 phút
        setStep("verifyOtp");
        setSuccessMessage(`Mã OTP đăng ký đã được gửi đến email ${formValues.email}. Vui lòng kiểm tra hộp thư và nhập mã để kích hoạt tài khoản.`);
      } catch (otpError: any) {
        setError(otpError.message || "Không thể gửi mã OTP đăng ký. Vui lòng thử lại hoặc liên hệ hỗ trợ.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
        setError("Please enter the 6-digit code sent to your email.");
      return;
    }

    setIsVerifyingOtp(true);
    setError(undefined);

    try {
      const deviceId = ensureDeviceId();
      const result = await authService.verifyRegisterOtp({
        email: registeredEmail,
        otp,
        deviceId,
      });

      if (result.accessToken) {
        setSuccessMessage("Registration and verification successful! Your account has been activated.");
        setTimeout(() => {
          navigate("/auth-flow/profile");
        }, 1500);
        return;
      }

        setSuccessMessage("Registration OTP code is valid. Please continue with security verification steps if required.");
    } catch (err: any) {
      setError(err.message || "Registration OTP code is incorrect or has expired");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setError(undefined);
      await authService.sendRegisterOtp(registeredEmail);
      setOtpCountdown(120);
      setOtp("");
      setSuccessMessage("Registration OTP code has been resent. Please check your email inbox again.");
    } catch (err: any) {
      setError(err.message || "Unable to resend registration OTP code. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-semibold text-slate-900">
        {step === "form" ? "Register Account" : "Account Verification"}
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        {step === "form"
          ? "Enter information to create a new account."
          : `Enter the OTP code just sent to email ${registeredEmail} to activate your account`}
      </p>

      {step === "form" ? (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Họ tên</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="Nguyễn Văn A"
            {...register("fullName", { required: "Please enter full name" })}
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
        </div>

        <GoogleReCaptcha
          onVerify={setRecaptchaToken}
          onExpire={() => setRecaptchaToken(null)}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="email@domain.com"
            {...register("email", {
              required: "Please enter email",
              pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
            })}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Số điện thoại</label>
          <input
            type="tel"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="0123456789"
            {...register("phone", {
              required: "Please enter phone number",
              minLength: { value: 8, message: "Phone number is too short" },
            })}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu</label>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="********"
            {...register("password", {
              required: "Please enter password",
              minLength: { value: 6, message: "Password must be at least 6 characters" },
            })}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          {password && (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Password strength:</span>
                <span className={`font-medium ${passwordStrength.strength === "weak" ? "text-red-500" : passwordStrength.strength === "fair" ? "text-blue-500" : passwordStrength.strength === "good" ? "text-blue-400" : "text-blue-600"}`}>
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
              {passwordStrength.feedback.length > 0 && (
                <ul className="text-xs text-slate-500 space-y-0.5 mt-1">
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

        <button
          type="submit"
          disabled={isSubmitting || (hasRecaptchaSiteKey && !recaptchaToken)}
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? "Processing..." : "Create Account"}
        </button>
      </form>
      ) : (
        <form className="space-y-4" onSubmit={handleVerifyOtp}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mã xác thực (OTP)</label>
            <input
              type="text"
              placeholder="Nhập mã 6 chữ số"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              maxLength={6}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-center text-2xl tracking-[0.6rem] font-mono shadow-sm focus:border-blue-500 focus:outline-none"
              disabled={isVerifyingOtp}
            />
            <p className="mt-1 text-xs text-slate-500">
              If you don't see the email, please check your spam folder or promotions folder.
            </p>
            {otpCountdown > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Code valid for: <span className="font-bold text-blue-600">{Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifyingOtp || otp.length !== 6}
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isVerifyingOtp ? "Verifying..." : "Verify & Login"}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isVerifyingOtp}
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {otpCountdown > 0 ? `Resend (${Math.floor(otpCountdown / 60)}:${(otpCountdown % 60).toString().padStart(2, '0')})` : "Resend Code"}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("form");
              setOtp("");
              setOtpCountdown(0);
              setError(undefined);
              setSuccessMessage(undefined);
            }}
            disabled={isVerifyingOtp}
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            Back to Edit Registration Information
          </button>
        </form>
      )}

      <div className="mt-4 space-y-2">
        <ErrorAlert message={error} />
        {successMessage && (
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;

