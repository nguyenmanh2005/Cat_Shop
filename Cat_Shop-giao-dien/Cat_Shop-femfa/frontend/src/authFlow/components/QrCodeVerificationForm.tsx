import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";
import ErrorAlert from "./ErrorAlert";

type BackupCodeFormValues = {
  backupCode: string;
};

const QrCodeVerificationForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BackupCodeFormValues>();
  
  const [error, setError] = useState<string | undefined>();
  const [email, setEmail] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(false);
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(false);
  const [checkingMfa, setCheckingMfa] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("authFlow.pendingEmail");
    if (!storedEmail) {
      navigate("/auth-flow/login", { replace: true });
      return;
    }
    setEmail(storedEmail);
    generateQrCode();
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

  // Tạo QR code
  const generateQrCode = async () => {
    try {
      setError(undefined);
      setLoading(true);
      // Gọi API tạo QR code (giả sử có endpoint này)
      // const response = await authService.generateQrCode();
      // setQrBase64(response.qrBase64);
      // setSessionId(response.sessionId);
      
      // Tạm thời hiển thị thông báo
      setError("QR Code feature is under development. Please use another method.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Unable to generate QR code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra trạng thái QR login
  const checkStatus = async () => {
    if (!sessionId) return;
    try {
      // const response = await authService.checkQrStatus(sessionId);
      // if (response.status === "approved") {
      //   setStatus("approved");
      //   localStorage.setItem("authFlow.currentUserEmail", email || "");
      //   navigate("/auth-flow/profile", { replace: true });
      // }
    } catch (err) {
      console.error("Error checking QR status:", err);
    }
  };

  // Polling để kiểm tra trạng thái - tăng interval để giảm request
  useEffect(() => {
    if (!sessionId || status !== "pending") return;
    const interval = setInterval(checkStatus, 10000); // 10 giây thay vì 2 giây
    return () => clearInterval(interval);
  }, [sessionId, status]);

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
            <h2 className="text-2xl font-semibold text-white mb-2">Verify with QR Code</h2>
            <p className="text-slate-300 text-sm">
              Scan QR code with mobile app to verify account
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-4 text-slate-400">Generating QR code...</p>
            </div>
          ) : qrBase64 ? (
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-6 flex items-center justify-center">
                <img src={qrBase64} alt="QR Code" className="w-64 h-64" />
              </div>
              <div className="text-center">
                <p className="text-slate-300 text-sm">
                  Scan this QR code with your mobile app
                </p>
                {status === "pending" && (
                  <p className="mt-2 text-blue-400 text-sm">Waiting for confirmation...</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-700 rounded-lg p-6 text-center">
              <p className="text-slate-300">Please generate QR code to continue</p>
            </div>
          )}

          {/* Phương án dự phòng: Backup Code - chỉ hiển thị nếu đã bật MFA */}
          {mfaEnabled && (
            <div className="mt-6 rounded-lg border border-slate-600 bg-slate-700/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm font-medium text-slate-300">
                    Can't scan QR Code?
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
              <form onSubmit={handleSubmit(async ({ backupCode }) => {
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
                  setError("Backup code is invalid or has been used.");
                }
              })} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Backup Code</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-center text-sm font-mono uppercase tracking-[0.3em] text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    placeholder="XXXX-XXXX"
                    maxLength={9}
                    {...register("backupCode", {
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
                      register("backupCode").onChange(e);
                    }}
                  />
                  {errors.backupCode && (
                    <p className="mt-1 text-xs text-red-400">{errors.backupCode.message}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    Backup Code is the recovery code you saved when enabling MFA. Each code can only be used once.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-amber-500 bg-amber-500/20 px-3 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Verifying..." : "Verify with Backup Code"}
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

export default QrCodeVerificationForm;

