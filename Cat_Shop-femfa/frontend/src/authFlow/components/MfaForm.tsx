import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";
import ErrorAlert from "./ErrorAlert";

type MfaFormValues = {
  code: string;
};

const MfaForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MfaFormValues>();
  const [error, setError] = useState<string | undefined>();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("authFlow.pendingEmail");
    if (!storedEmail) {
      navigate("/auth-flow/login", { replace: true });
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  // Gửi mã Google Authenticator để hoàn tất MFA
  const onSubmit = async ({ code }: MfaFormValues) => {
    if (!email) return;
    try {
      setError(undefined);
      await authService.verifyMfa({ email, code });
      localStorage.setItem("authFlow.currentUserEmail", email);
      navigate("/auth-flow/profile", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Mã xác thực không chính xác, vui lòng thử lại.");
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-semibold text-slate-900">Xác thực MFA</h2>
      <p className="mb-6 text-sm text-slate-500">
        Mở ứng dụng Google Authenticator và nhập mã gồm 6 chữ số để hoàn tất đăng nhập.
      </p>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mã xác thực</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase tracking-[0.3em] focus:border-blue-500 focus:outline-none"
            placeholder="123456"
            {...register("code", {
              required: "Vui lòng nhập mã xác thực",
              minLength: { value: 6, message: "Mã gồm 6 ký tự" },
              maxLength: { value: 6, message: "Mã gồm 6 ký tự" },
            })}
          />
          {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? "Đang xác thực..." : "Xác nhận"}
        </button>
      </form>

      <div className="mt-4">
        <ErrorAlert message={error} />
      </div>
    </div>
  );
};

export default MfaForm;

