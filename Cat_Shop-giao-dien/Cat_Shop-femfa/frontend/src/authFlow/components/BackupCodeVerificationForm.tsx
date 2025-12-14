import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";
import ErrorAlert from "./ErrorAlert";

type BackupCodeFormValues = {
  code: string;
};

const BackupCodeVerificationForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BackupCodeFormValues>();
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
      console.error("Unable to check MFA status:", err);
      setMfaEnabled(false);
    } finally {
      setCheckingMfa(false);
    }
  };

  // Xác thực Backup Code
  const onSubmit = async ({ code }: BackupCodeFormValues) => {
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
      setError("Backup Code is incorrect or has been used, please try again.");
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
              Back
            </button>
            <h2 className="text-2xl font-semibold text-white mb-2">Verify with Backup Code</h2>
            <p className="text-slate-300 text-sm">
              Enter the backup code you saved when enabling MFA
            </p>
          </div>

          {checkingMfa ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
              <p className="mt-4 text-slate-400">Checking MFA status...</p>
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
                  <p className="text-sm font-medium text-amber-300">Account has not activated Google Authenticator</p>
                  <p className="mt-1 text-xs text-amber-400">
                    Please activate Google Authenticator in account settings before using this method.
                  </p>
                  <button
                    onClick={() => navigate("/auth-flow/login")}
                    className="mt-3 text-sm text-amber-300 hover:text-amber-200 underline"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  Backup Code
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-center text-lg font-mono uppercase tracking-[0.3em] text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
                  placeholder="XXXX-XXXX"
                  maxLength={9}
                  {...register("code", {
                    required: "Please enter Backup Code",
                    pattern: {
                      value: /^[A-Z0-9]{4}-[A-Z0-9]{4}$/,
                      message: "Backup Code must be in format XXXX-XXXX",
                    },
                  })}
                  onChange={(e) => {
                    // Tự động format backup code
                    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                    // Thêm dấu gạch ngang sau 4 ký tự
                    if (value.length > 4 && !value.includes('-')) {
                      value = value.slice(0, 4) + '-' + value.slice(4, 8);
                    }
                    e.target.value = value;
                    register("code").onChange(e);
                  }}
                />
                {errors.code && <p className="mt-1 text-xs text-red-400">{errors.code.message}</p>}
                <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="text-xs text-amber-300 mb-1">
                    <strong>💡 Note:</strong> Backup Code is the recovery code you saved when enabling MFA
                  </p>
                  <p className="text-xs text-amber-400">
                    Each code can only be used once. If you don't have a backup code, please use other verification methods.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-600"
              >
                {isSubmitting ? "Verifying..." : "Verify"}
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

export default BackupCodeVerificationForm;

