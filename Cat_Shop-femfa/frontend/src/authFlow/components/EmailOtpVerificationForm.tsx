import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";
import ErrorAlert from "./ErrorAlert";

type EmailOtpFormValues = {
  otp: string;
};

const EmailOtpVerificationForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailOtpFormValues>();
  const [error, setError] = useState<string | undefined>();
  const [email, setEmail] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("authFlow.pendingEmail");
    const storedDeviceId = sessionStorage.getItem("authFlow.pendingDeviceId");

    if (!storedEmail || !storedDeviceId) {
      navigate("/auth-flow/login", { replace: true });
      return;
    }

    setEmail(storedEmail);
    setDeviceId(storedDeviceId);
  }, [navigate]);

  // Gửi mã OTP
  const handleSendOtp = async () => {
    if (!email) return;
    try {
      setError(undefined);
      setSendingOtp(true);
      await authService.sendOtp(email);
      alert("Mã OTP đã được gửi đến email của bạn!");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Không thể gửi mã OTP. Vui lòng thử lại.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Xác thực OTP
  const onSubmit = async ({ otp }: EmailOtpFormValues) => {
    if (!email || !deviceId) return;
    try {
      setError(undefined);
      await authService.verifyOtp({ email, otp, deviceId });

      // OTP verification thành công - chuyển đến profile
      localStorage.setItem("authFlow.currentUserEmail", email);
      navigate("/auth-flow/profile", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("OTP không hợp lệ, vui lòng thử lại.");
    }
  };

  if (!email || !deviceId) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-800">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div>
            <button
              onClick={() => navigate("/auth-flow/verify")}
              className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 text-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
            <h2 className="text-2xl font-semibold text-white mb-2">Xác minh bằng Email OTP</h2>
            <p className="text-slate-300 text-sm">
              Vui lòng nhập mã OTP đã gửi đến email <span className="font-medium text-white">{email}</span>
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Mã OTP</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm uppercase tracking-[0.3em] text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                placeholder="123456"
                {...register("otp", {
                  required: "Vui lòng nhập mã OTP",
                  minLength: { value: 6, message: "OTP gồm 6 ký tự" },
                  maxLength: { value: 6, message: "OTP gồm 6 ký tự" },
                })}
              />
              {errors.otp && <p className="mt-1 text-xs text-red-400">{errors.otp.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {isSubmitting ? "Đang xác thực..." : "Xác nhận OTP"}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp}
              className="text-sm text-blue-400 hover:text-blue-300 disabled:text-slate-500"
            >
              {sendingOtp ? "Đang gửi..." : "Gửi lại mã OTP"}
            </button>
          </div>

          <div className="mt-4">
            <ErrorAlert message={error} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailOtpVerificationForm;

