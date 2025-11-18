import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";
import ErrorAlert from "./ErrorAlert";

type MfaFormValues = {
  code: string;
};

type BackupCodeFormValues = {
  backupCode: string;
};

const MfaForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MfaFormValues>();
  const {
    register: registerBackupCode,
    handleSubmit: handleSubmitBackupCode,
    formState: { errors: errorsBackupCode, isSubmitting: isSubmittingBackupCode },
    reset: resetBackupCode,
  } = useForm<BackupCodeFormValues>();
  const [error, setError] = useState<string | undefined>();
  const [email, setEmail] = useState<string | null>(null);
  const [showBackupCodeForm, setShowBackupCodeForm] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("authFlow.pendingEmail");
    if (!storedEmail) {
      navigate("/auth-flow/login", { replace: true });
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  // Format backup code input (XXXX-XXXX)
  const formatBackupCode = (value: string) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    if (cleaned.length <= 4) {
      return cleaned;
    }
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
  };

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

  // Gửi Backup Code để hoàn tất MFA
  const onBackupCodeSubmit = async ({ backupCode }: BackupCodeFormValues) => {
    if (!email) return;
    try {
      setError(undefined);
      await authService.verifyMfa({ email, code: backupCode });
      localStorage.setItem("authFlow.currentUserEmail", email);
      navigate("/auth-flow/profile", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Backup Code không chính xác hoặc đã được sử dụng, vui lòng thử lại.");
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-semibold text-slate-900">Xác thực MFA</h2>
      <p className="mb-6 text-sm text-slate-500">
        Chọn phương thức xác minh: Google Authenticator hoặc Backup Code.
      </p>

      {/* Radio buttons để chọn phương thức xác minh */}
      <div className="mb-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="verificationMethod"
              value="googleAuth"
              checked={!showBackupCodeForm}
              onChange={() => {
                setShowBackupCodeForm(false);
                resetBackupCode();
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700">Google Authenticator</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="verificationMethod"
              value="backupCode"
              checked={showBackupCodeForm}
              onChange={() => {
                setShowBackupCodeForm(true);
                reset();
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700">Backup Code</span>
          </label>
        </div>
      </div>

      {/* Form Google Authenticator */}
      {!showBackupCodeForm && (
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
      )}

      {/* Form Backup Code */}
      {showBackupCodeForm && (
        <form className="space-y-4" onSubmit={handleSubmitBackupCode(onBackupCodeSubmit)}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Backup Code</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase tracking-[0.2em] font-mono focus:border-blue-500 focus:outline-none"
              placeholder="XXXX-XXXX"
              {...registerBackupCode("backupCode", {
                required: "Vui lòng nhập backup code",
                pattern: {
                  value: /^[A-Z0-9]{4}-[A-Z0-9]{4}$/,
                  message: "Định dạng: XXXX-XXXX (chữ và số)",
                },
                onChange: (e) => {
                  e.target.value = formatBackupCode(e.target.value);
                },
              })}
              maxLength={9}
            />
            {errorsBackupCode.backupCode && (
              <p className="mt-1 text-xs text-red-600">{errorsBackupCode.backupCode.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmittingBackupCode}
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmittingBackupCode ? "Đang xác thực..." : "Xác nhận"}
          </button>
        </form>
      )}

      <div className="mt-4">
        <ErrorAlert message={error} />
      </div>
    </div>
  );
};

export default MfaForm;

