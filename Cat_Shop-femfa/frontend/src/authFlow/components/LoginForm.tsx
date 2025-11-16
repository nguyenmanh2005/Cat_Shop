import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authService, tokenStorage } from "../api/authService";
import type { LoginPayload } from "../api/authService";
import ErrorAlert from "./ErrorAlert";

type LoginFormValues = Omit<LoginPayload, "deviceId">;

const LoginForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();
  const [error, setError] = useState<string | undefined>();

  // Redirect trực tiếp trong cùng tab để đăng nhập Google
  const handleGoogleLogin = () => {
    const oauthUrl = "http://localhost:8080/oauth2/authorization/google";
    // Redirect trong cùng tab thay vì mở popup
    window.location.href = oauthUrl;
  };

  // Gửi thông tin đăng nhập kèm deviceId và xử lý các nhánh phản hồi
  const onSubmit = async (formValues: LoginFormValues) => {
    try {
      setError(undefined);
      const result = await authService.login(formValues);

      sessionStorage.setItem("authFlow.pendingEmail", formValues.email);
      if (result.deviceId) {
        sessionStorage.setItem("authFlow.pendingDeviceId", result.deviceId);
      }

      localStorage.setItem("authFlow.currentUserEmail", formValues.email);

      if (result.accessToken && result.refreshToken) {
        navigate("/auth-flow/profile", { replace: true });
        return;
      }

      if (result.message?.toLowerCase().includes("thiết bị mới phát hiện") || !result.accessToken) {
        navigate("/auth-flow/otp", { replace: true });
        return;
      }

      if (result.mfaRequired) {
        navigate("/auth-flow/mfa", { replace: true });
        return;
      }

      navigate("/auth-flow/profile", { replace: true });
    } catch (err) {
      tokenStorage.clear();
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Không thể đăng nhập. Vui lòng thử lại.");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-semibold text-slate-900">Đăng nhập</h2>
      <p className="mb-6 text-sm text-slate-500">Nhập email và mật khẩu để tiếp tục.</p>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <div className="my-6 flex items-center">
        <span className="h-px w-full bg-slate-200" />
        <span className="px-3 text-xs font-medium uppercase tracking-wide text-slate-400">Hoặc</span>
        <span className="h-px w-full bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:shadow-md"
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

      <div className="mt-4">
        <ErrorAlert message={error} />
      </div>
    </div>
  );
};

export default LoginForm;

