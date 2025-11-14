import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";
import ErrorAlert from "./ErrorAlert";

type GoogleAuthenticatorFormValues = {
  code: string;
};

const GoogleAuthenticatorVerificationForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GoogleAuthenticatorFormValues>();
  const [error, setError] = useState<string | undefined>();
  const [email, setEmail] = useState<string | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [checkingMfa, setCheckingMfa] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("authFlow.pendingEmail");
    if (!storedEmail) {
      navigate("/auth-flow/login", { replace: true });
      return;
    }
    setEmail(storedEmail);
    checkMfaStatus();
  }, [navigate]);

  // Kiểm tra trạng thái MFA
  const checkMfaStatus = async () => {
    const storedEmail = sessionStorage.getItem("authFlow.pendingEmail");
    if (!storedEmail) return;
    try {
      setCheckingMfa(true);
      const status = await authService.checkMfaStatus(storedEmail);
      setMfaEnabled(status.mfaEnabled);
    } catch (err) {
      console.error("Không thể kiểm tra trạng thái MFA:", err);
      setMfaEnabled(false);
    } finally {
      setCheckingMfa(false);
    }
  };

  // Xác thực Google Authenticator
  const onSubmit = async ({ code }: GoogleAuthenticatorFormValues) => {
    if (!email) return;
    try {
      setError(undefined);
      await authService.verifyMfa({ email, code });

      // Verification thành công - chuyển đến profile
      localStorage.setItem("authFlow.currentUserEmail", email);
      navigate("/auth-flow/profile", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Mã Google Authenticator không chính xác, vui lòng thử lại.");
    }
  };

  if (!email) {
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
            <h2 className="text-2xl font-semibold text-white mb-2">Xác minh bằng Google Authenticator</h2>
            <p className="text-slate-300 text-sm">
              Nhập mã từ ứng dụng Google Authenticator để xác minh tài khoản
            </p>
          </div>

          {checkingMfa ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
              <p className="mt-4 text-slate-400">Đang kiểm tra trạng thái MFA...</p>
            </div>
          ) : mfaEnabled === false ? (
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-300">Tài khoản chưa kích hoạt mã Google Authenticator</p>
                  <p className="mt-1 text-xs text-amber-400">
                    Vui lòng kích hoạt Google Authenticator trong phần cài đặt tài khoản trước khi sử dụng phương thức này.
                  </p>
                  <button
                    onClick={() => navigate("/auth-flow/login")}
                    className="mt-3 text-sm text-amber-300 hover:text-amber-200 underline"
                  >
                    Quay lại đăng nhập
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Mã Google Authenticator</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm uppercase tracking-[0.3em] text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                  placeholder="123456"
                  {...register("code", {
                    required: "Vui lòng nhập mã xác thực",
                    minLength: { value: 6, message: "Mã gồm 6 ký tự" },
                    maxLength: { value: 6, message: "Mã gồm 6 ký tự" },
                  })}
                />
                {errors.code && <p className="mt-1 text-xs text-red-400">{errors.code.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-600"
              >
                {isSubmitting ? "Đang xác thực..." : "Xác nhận"}
              </button>
            </form>
          )}

          <div className="mt-4">
            <ErrorAlert message={error} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthenticatorVerificationForm;

