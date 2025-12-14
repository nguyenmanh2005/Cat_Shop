import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";
import ErrorAlert from "./ErrorAlert";

type EmailOtpFormValues = {
  otp: string;
};

type BackupCodeFormValues = {
  backupCode: string;
};

const EmailOtpVerificationForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailOtpFormValues>();
  
  const {
    register: registerBackup,
    handleSubmit: handleSubmitBackup,
    formState: { errors: errorsBackup, isSubmitting: isSubmittingBackup },
  } = useForm<BackupCodeFormValues>();
  
  const [error, setError] = useState<string | undefined>();
  const [email, setEmail] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(false);
  const [checkingMfa, setCheckingMfa] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("authFlow.pendingEmail");
    const storedDeviceId = sessionStorage.getItem("authFlow.pendingDeviceId");

    if (!storedEmail || !storedDeviceId) {
      navigate("/auth-flow/login", { replace: true });
      return;
    }

    setEmail(storedEmail);
    setDeviceId(storedDeviceId);
    checkMfaStatus();
  }, [navigate]);

  // Kiểm tra trạng thái MFA để biết có backup code không
  const checkMfaStatus = async () => {
    const storedEmail = sessionStorage.getItem("authFlow.pendingEmail");
    if (!storedEmail) return;
    try {
      setCheckingMfa(true);
      const status = await authService.checkMfaStatus(storedEmail);
      setMfaEnabled(status.mfaEnabled || false);
    } catch (err) {
      console.error("Unable to check MFA status:", err);
      setMfaEnabled(false);
    } finally {
      setCheckingMfa(false);
    }
  };

  // Gửi mã OTP
  const handleSendOtp = async () => {
    if (!email) return;
    try {
      setError(undefined);
      setSendingOtp(true);
      await authService.sendOtp(email);
      alert("OTP code has been sent to your email!");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Unable to send OTP code. Please try again.");
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
      setError("Invalid OTP, please try again.");
    }
  };

  // Xác thực bằng Backup Code (phương án dự phòng)
  const onBackupCodeSubmit = async ({ backupCode }: BackupCodeFormValues) => {
    if (!email) return;
    try {
      setError(undefined);
      // Backup code được verify qua MFA endpoint
      await authService.verifyMfa({ email, code: backupCode });

      // Backup code verification thành công - chuyển đến profile
      localStorage.setItem("authFlow.currentUserEmail", email);
      navigate("/auth-flow/profile", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Backup code is invalid or has been used.");
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
              Back
            </button>
            <h2 className="text-2xl font-semibold text-white mb-2">Verify with Email OTP</h2>
            <p className="text-slate-300 text-sm">
              Please enter the OTP code sent to email <span className="font-medium text-white">{email}</span>
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">OTP Code</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm uppercase tracking-[0.3em] text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                placeholder="123456"
                {...register("otp", {
                  required: "Please enter OTP code",
                  minLength: { value: 6, message: "OTP must be 6 characters" },
                  maxLength: { value: 6, message: "OTP must be 6 characters" },
                })}
              />
              {errors.otp && <p className="mt-1 text-xs text-red-400">{errors.otp.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp}
              className="text-sm text-blue-400 hover:text-blue-300 disabled:text-slate-500"
            >
              {sendingOtp ? "Sending..." : "Resend OTP Code"}
            </button>
          </div>

          {/* Phương án dự phòng: Backup Code - chỉ hiển thị nếu đã bật MFA */}
          {mfaEnabled && (
            <div className="mt-6 rounded-lg border border-slate-600 bg-slate-700/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm font-medium text-slate-300">
                    Didn't receive email OTP?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBackupCode(!showBackupCode)}
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  {showBackupCode ? "Hide" : "Use Backup Code"}
                </button>
              </div>
            
            {showBackupCode && (
              <form onSubmit={handleSubmitBackup(onBackupCodeSubmit)} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Backup Code</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-center text-sm font-mono uppercase tracking-[0.3em] text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    placeholder="XXXX-XXXX"
                    maxLength={9}
                    {...registerBackup("backupCode", {
                      required: "Please enter Backup Code",
                      pattern: {
                        value: /^[A-Z0-9]{4}-[A-Z0-9]{4}$/,
                        message: "Backup Code must be in format XXXX-XXXX",
                      },
                    })}
                    onChange={(e) => {
                      let value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                      if (value.length > 4 && !value.includes('-')) {
                        value = value.slice(0, 4) + '-' + value.slice(4, 8);
                      }
                      e.target.value = value;
                      registerBackup("backupCode").onChange(e);
                    }}
                  />
                  {errorsBackup.backupCode && (
                    <p className="mt-1 text-xs text-red-400">{errorsBackup.backupCode.message}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    Backup Code is the recovery code you saved when enabling MFA. Each code can only be used once.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingBackup}
                  className="w-full rounded-lg border border-amber-500 bg-amber-500/20 px-3 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmittingBackup ? "Verifying..." : "Verify with Backup Code"}
                </button>
              </form>
            )}
            </div>
          )}

          <div className="mt-4">
            <ErrorAlert message={error} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailOtpVerificationForm;

