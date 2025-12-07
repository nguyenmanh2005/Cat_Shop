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
    if (!recaptchaToken) {
      setError("Vui lòng xác thực reCAPTCHA để tiếp tục");
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
      setError("Vui lòng nhập mã 6 chữ số được gửi đến email của bạn.");
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
        setSuccessMessage("Đăng ký và xác thực thành công! Tài khoản của bạn đã được kích hoạt.");
        setTimeout(() => {
          navigate("/auth-flow/profile");
        }, 1500);
        return;
      }

      setSuccessMessage("Mã OTP đăng ký hợp lệ. Vui lòng tiếp tục các bước xác thực bảo mật nếu được yêu cầu.");
    } catch (err: any) {
      setError(err.message || "Mã OTP đăng ký không chính xác hoặc đã hết hạn");
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
      setSuccessMessage("Mã OTP đăng ký đã được gửi lại. Vui lòng kiểm tra lại hộp thư email của bạn.");
    } catch (err: any) {
      setError(err.message || "Không thể gửi lại mã OTP đăng ký. Vui lòng thử lại.");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-semibold text-slate-900">
        {step === "form" ? "Đăng ký tài khoản" : "Xác thực tài khoản"}
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        {step === "form"
          ? "Nhập thông tin để tạo tài khoản mới."
          : `Nhập mã OTP vừa được gửi đến email ${registeredEmail} để kích hoạt tài khoản`}
      </p>

      {step === "form" ? (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Họ tên</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="Nguyễn Văn A"
            {...register("fullName", { required: "Vui lòng nhập họ tên" })}
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
              required: "Vui lòng nhập email",
              pattern: { value: /^\S+@\S+$/i, message: "Email không hợp lệ" },
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
              required: "Vui lòng nhập số điện thoại",
              minLength: { value: 8, message: "Số điện thoại quá ngắn" },
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
              required: "Vui lòng nhập mật khẩu",
              minLength: { value: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
            })}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          {password && (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Độ mạnh mật khẩu:</span>
                <span className={`font-medium ${passwordStrength.strength === "weak" ? "text-red-500" : passwordStrength.strength === "fair" ? "text-orange-500" : passwordStrength.strength === "good" ? "text-yellow-500" : "text-green-500"}`}>
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
          disabled={isSubmitting || !recaptchaToken}
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? "Đang xử lý..." : "Tạo tài khoản"}
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
              Nếu không thấy email, vui lòng kiểm tra hộp thư rác (spam) hoặc thư mục quảng cáo.
            </p>
            {otpCountdown > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Mã còn hiệu lực trong: <span className="font-bold text-blue-600">{Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifyingOtp || otp.length !== 6}
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isVerifyingOtp ? "Đang xác thực..." : "Xác thực & đăng nhập"}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isVerifyingOtp}
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {otpCountdown > 0 ? `Gửi lại (${Math.floor(otpCountdown / 60)}:${(otpCountdown % 60).toString().padStart(2, '0')})` : "Gửi lại mã"}
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
            Quay về chỉnh sửa thông tin đăng ký
          </button>
        </form>
      )}

      <div className="mt-4 space-y-2">
        <ErrorAlert message={error} />
        {successMessage && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;

