import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../api/authService";
import ErrorAlert from "./ErrorAlert";

type GoogleAuthenticatorFormValues = {
  code: string;
};

const GoogleAuthenticatorVerificationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GoogleAuthenticatorFormValues>();
  const [error, setError] = useState<string | undefined>();
  const [email, setEmail] = useState<string | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [checkingMfa, setCheckingMfa] = useState(false);
  // Tự động chọn tab backup code nếu điều hướng từ link "Dùng Backup Code"
  const [codeType, setCodeType] = useState<"google-auth" | "backup-code">("google-auth");

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("authFlow.pendingEmail");
    if (!storedEmail) {
      navigate("/auth-flow/login", { replace: true });
      return;
    }
    setEmail(storedEmail);
    checkMfaStatus();
    
    // Nếu có state useBackupCode, tự động chọn tab backup code
    if ((location.state as { useBackupCode?: boolean })?.useBackupCode) {
      setCodeType("backup-code");
    }
  }, [navigate, location.state]);

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
      setError("Google Authenticator code is incorrect, please try again.");
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
            <h2 className="text-2xl font-semibold text-white mb-2">Verify with Google Authenticator</h2>
            <p className="text-slate-300 text-sm">
              Select verification method: code from Google Authenticator app or Backup Code
            </p>
          </div>

          {/* Tabs để chọn loại mã */}
          {mfaEnabled && (
            <div className="flex gap-2 rounded-lg bg-slate-700 p-1">
              <button
                type="button"
                onClick={() => setCodeType("google-auth")}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                  codeType === "google-auth"
                    ? "bg-purple-600 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Google Authenticator
              </button>
              <button
                type="button"
                onClick={() => setCodeType("backup-code")}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                  codeType === "backup-code"
                    ? "bg-purple-600 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Backup Code
              </button>
            </div>
          )}

          {checkingMfa ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
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
                  {codeType === "google-auth" ? "Google Authenticator Code" : "Backup Code"}
                </label>
                
                {codeType === "google-auth" ? (
                  <>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-center text-2xl tracking-[0.6em] text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                      placeholder="123456"
                      maxLength={6}
                      {...register("code", {
                        required: "Please enter Google Authenticator code",
                        pattern: {
                          value: /^\d{6}$/,
                          message: "Code must be 6 digits",
                        },
                      })}
                      onChange={(e) => {
                        // Chỉ cho phép số
                        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                        register("code").onChange(e);
                      }}
                    />
                    {errors.code && <p className="mt-1 text-xs text-red-400">{errors.code.message}</p>}
                    <p className="mt-2 text-xs text-slate-400">
                      Open Google Authenticator app and enter the current 6-digit code
                    </p>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-center text-lg font-mono uppercase tracking-[0.3em] text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
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
                        Each code can only be used once. If you don't have a backup code, please use Google Authenticator code.
                      </p>
                    </div>
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-600"
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

export default GoogleAuthenticatorVerificationForm;

