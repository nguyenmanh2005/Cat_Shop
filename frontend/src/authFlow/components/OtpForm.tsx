import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";
import ErrorAlert from "./ErrorAlert";

type OtpFormValues = {
  otp: string;
};

const OtpForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormValues>();
  const [error, setError] = useState<string | undefined>();
  const [email, setEmail] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

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

  // Gửi mã OTP xác thực thiết bị mới
  const onSubmit = async ({ otp }: OtpFormValues) => {
    if (!email || !deviceId) return;
    try {
      setError(undefined);
      const result = await authService.verifyOtp({ email, otp, deviceId });

      if (result.mfaRequired) {
        navigate("/auth-flow/mfa", { replace: true });
        return;
      }

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
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-semibold text-slate-900">Xác thực thiết bị</h2>
      <p className="mb-6 text-sm text-slate-500">
        Vui lòng nhập mã OTP đã gửi đến email <span className="font-medium">{email}</span>.
      </p>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mã OTP</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase tracking-[0.3em] focus:border-blue-500 focus:outline-none"
            placeholder="123456"
            {...register("otp", {
              required: "Vui lòng nhập mã OTP",
              minLength: { value: 6, message: "OTP gồm 6 ký tự" },
              maxLength: { value: 6, message: "OTP gồm 6 ký tự" },
            })}
          />
          {errors.otp && <p className="mt-1 text-xs text-red-600">{errors.otp.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? "Đang xác thực..." : "Xác nhận OTP"}
        </button>
      </form>

      <div className="mt-4">
        <ErrorAlert message={error} />
      </div>
    </div>
  );
};

export default OtpForm;

