import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authService, tokenStorage } from "../api/authService";
import ErrorAlert from "./ErrorAlert";

type GoogleAuthenticatorFormValues = {
  code: string;
};

type BackupCodeFormValues = {
  backupCode: string;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [checkingMfa, setCheckingMfa] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [remainingBackupCodes, setRemainingBackupCodes] = useState<number>(0);
  const [regeneratingCodes, setRegeneratingCodes] = useState(false);
  const [showBackupCodeForm, setShowBackupCodeForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GoogleAuthenticatorFormValues>();

  const {
    register: registerBackupCode,
    handleSubmit: handleSubmitBackupCode,
    formState: { errors: errorsBackupCode },
    reset: resetBackupCode,
  } = useForm<BackupCodeFormValues>();

  const accessToken = tokenStorage.getAccessToken();
  const refreshToken = tokenStorage.getRefreshToken();
  const email =
    localStorage.getItem("authFlow.currentUserEmail") ??
    sessionStorage.getItem("authFlow.pendingEmail") ??
    "Chưa xác định";
  const deviceId = tokenStorage.getDeviceId();

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      navigate("/auth-flow/login", { replace: true });
    }
  }, [accessToken, refreshToken, navigate]);

  // Kiểm tra trạng thái MFA khi component mount
  useEffect(() => {
    const checkMfaStatus = async () => {
      if (!email || email === "Chưa xác định") return;
      try {
        setCheckingMfa(true);
        const status = await authService.checkMfaStatus(email);
        setMfaEnabled(status.mfaEnabled);
        if (status.remainingBackupCodes !== undefined) {
          setRemainingBackupCodes(status.remainingBackupCodes);
        }
      } catch (err) {
        console.error("Không thể kiểm tra trạng thái MFA:", err);
        setMfaEnabled(false);
      } finally {
        setCheckingMfa(false);
      }
    };
    checkMfaStatus();
  }, [email]);

  const maskedToken = useMemo(
    () =>
      accessToken
        ? `${accessToken.slice(0, 12)}...${accessToken.slice(-8)}`
        : "Không tìm thấy accessToken. Vui lòng đăng nhập lại.",
    [accessToken],
  );

  // Yêu cầu backend tạo mã QR để bật MFA
  const handleEnableMfa = async () => {
    if (!email || email === "Chưa xác định") {
      setError("Không tìm thấy email. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      setError(undefined);
      setLoadingQr(true);
      setQrBase64(null);
      const data = await authService.enableMfa(email);
      setQrBase64(data.qrBase64);
      // Lưu backup codes nếu có
      if (data.backupCodes && Array.isArray(data.backupCodes)) {
        setBackupCodes(data.backupCodes);
        setShowBackupCodes(true);
        setRemainingBackupCodes(data.backupCodes.length);
      }
      // Cập nhật trạng thái MFA sau khi bật thành công
      setMfaEnabled(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Không thể bật MFA. Vui lòng thử lại.");
    } finally {
      setLoadingQr(false);
    }
  };

  // Tạo lại backup codes
  const handleRegenerateBackupCodes = async () => {
    if (!email || email === "Chưa xác định") {
      setError("Không tìm thấy email. Vui lòng đăng nhập lại.");
      return;
    }
    if (!window.confirm("Bạn có chắc muốn tạo lại backup codes? Các mã cũ sẽ bị vô hiệu hóa.")) {
      return;
    }
    try {
      setError(undefined);
      setRegeneratingCodes(true);
      const data = await authService.regenerateBackupCodes(email);
      setBackupCodes(data.backupCodes);
      setShowBackupCodes(true);
      setRemainingBackupCodes(data.backupCodes.length);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Không thể tạo lại backup codes. Vui lòng thử lại.");
    } finally {
      setRegeneratingCodes(false);
    }
  };

  // Xác minh mã Google Authenticator
  const onVerifyGoogleAuthenticator = async ({ code }: GoogleAuthenticatorFormValues) => {
    if (!email || email === "Chưa xác định") {
      setError("Không tìm thấy email. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      setError(undefined);
      setVerifyingCode(true);
      await authService.verifyMfa({ email, code });
      reset();
      setError(undefined);
      setShowBackupCodeForm(false);
      // Có thể hiển thị thông báo thành công hoặc refresh trang
      alert("Xác minh Google Authenticator thành công!");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Mã Google Authenticator không chính xác, vui lòng thử lại.");
    } finally {
      setVerifyingCode(false);
    }
  };

  // Xác minh Backup Code
  const onVerifyBackupCode = async ({ backupCode }: BackupCodeFormValues) => {
    if (!email || email === "Chưa xác định") {
      setError("Không tìm thấy email. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      setError(undefined);
      setVerifyingCode(true);
      await authService.verifyMfa({ email, code: backupCode });
      resetBackupCode();
      setError(undefined);
      setShowBackupCodeForm(false);
      // Cập nhật số lượng backup codes còn lại
      const status = await authService.checkMfaStatus(email);
      if (status.remainingBackupCodes !== undefined) {
        setRemainingBackupCodes(status.remainingBackupCodes);
      }
      alert("Xác minh Backup Code thành công!");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Backup Code không chính xác hoặc đã được sử dụng, vui lòng thử lại.");
    } finally {
      setVerifyingCode(false);
    }
  };

  // Format backup code input (XXXX-XXXX)
  const formatBackupCode = (value: string) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    if (cleaned.length <= 4) {
      return cleaned;
    }
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
  };

  // Gọi API logout và dọn dẹp token phía client
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignored
    } finally {
      tokenStorage.clear();
      localStorage.removeItem("authFlow.currentUserEmail");
      sessionStorage.removeItem("authFlow.pendingEmail");
      sessionStorage.removeItem("authFlow.pendingDeviceId");
      setQrBase64(null);
      navigate("/auth-flow/login", { replace: true });
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Xin chào, {email}</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý bảo mật tài khoản tại đây.</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          Đăng xuất
        </button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-100 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Thông tin phiên</h2>
          <dl className="mt-3 space-y-2 text-sm text-slate-600">
            <div>
              <dt className="font-medium text-slate-500">Access Token</dt>
              <dd className="mt-1 break-all rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{maskedToken}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Refresh Token</dt>
              <dd className="mt-1 text-xs text-slate-700">
                {refreshToken ? `${refreshToken.slice(0, 12)}...${refreshToken.slice(-8)}` : "Không có"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Device ID</dt>
              <dd className="mt-1 text-xs text-slate-700">{deviceId ?? "Chưa thiết lập"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-slate-100 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Bật xác thực đa yếu tố</h2>
          <p className="mt-2 text-sm text-slate-600">
            Quét mã QR bằng ứng dụng Google Authenticator để kích hoạt bảo vệ nâng cao.
          </p>

          <button
            onClick={handleEnableMfa}
            disabled={loadingQr}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loadingQr ? "Đang tạo mã..." : "Tạo mã QR"}
          </button>

          {qrBase64 && (
            <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4 text-center">
              <img src={qrBase64} alt="QR MFA" className="mx-auto h-40 w-40 object-contain" />
              <p className="mt-2 text-xs text-slate-500">
                Sử dụng QR này trong ứng dụng Google Authenticator để bật MFA.
              </p>
            </div>
          )}

          {/* Hiển thị Backup Codes */}
          {showBackupCodes && backupCodes.length > 0 && (
            <div className="mt-4 rounded-lg border-2 border-amber-400 bg-amber-50 p-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h3 className="text-sm font-bold text-amber-900">Backup Codes (Recovery Codes)</h3>
                </div>
                <button
                  onClick={() => setShowBackupCodes(false)}
                  className="text-xs text-amber-700 hover:text-amber-900 font-medium"
                >
                  Ẩn
                </button>
              </div>
              
              <div className="mb-3 rounded-lg bg-amber-100 p-3 border border-amber-300">
                <p className="text-xs font-semibold text-amber-900 mb-1">
                  ⚠️ <strong>QUAN TRỌNG: Lưu các mã này ngay bây giờ!</strong>
                </p>
                <p className="text-xs text-amber-800">
                  • Mỗi mã chỉ dùng được <strong>1 lần</strong><br/>
                  • Dùng khi <strong>không thể truy cập Google Authenticator</strong><br/>
                  • Lưu ở nơi an toàn (ghi ra giấy, lưu file, password manager)
                </p>
              </div>

              <div className="mb-3 rounded-lg bg-white p-4 border-2 border-amber-300">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="rounded border-2 border-amber-400 bg-amber-50 px-3 py-2 text-center font-mono text-sm font-bold text-amber-900 select-all"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-amber-800">
                  Còn lại: <span className="text-amber-900 text-base">{remainingBackupCodes}</span> mã
                </p>
                <button
                  onClick={() => {
                    // Tạo file text để download
                    const content = `BACKUP CODES - CatShop\n\n` +
                      `Lưu các mã này ở nơi an toàn. Mỗi mã chỉ dùng được 1 lần.\n\n` +
                      backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n') +
                      `\n\nNgày tạo: ${new Date().toLocaleString('vi-VN')}\n` +
                      `Email: ${email}`;
                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `catshop-backup-codes-${new Date().getTime()}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-amber-600 bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-900 transition hover:bg-amber-200"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Tải xuống
                </button>
              </div>
            </div>
          )}

          {/* Quản lý Backup Codes */}
          {mfaEnabled && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <h3 className="text-sm font-semibold text-slate-700">Quản lý Backup Codes</h3>
              </div>
              
              <div className="mb-3 rounded-lg bg-white p-3 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600">Backup codes còn lại</p>
                    <p className="text-lg font-bold text-slate-900">{remainingBackupCodes} / 10</p>
                  </div>
                  {remainingBackupCodes < 3 && remainingBackupCodes > 0 && (
                    <div className="rounded-lg bg-amber-100 px-2 py-1">
                      <p className="text-xs font-semibold text-amber-800">⚠️ Sắp hết!</p>
                    </div>
                  )}
                  {remainingBackupCodes === 0 && (
                    <div className="rounded-lg bg-red-100 px-2 py-1">
                      <p className="text-xs font-semibold text-red-800">⚠️ Đã hết!</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {backupCodes.length > 0 && !showBackupCodes && (
                  <button
                    onClick={() => setShowBackupCodes(true)}
                    className="w-full rounded-lg border-2 border-blue-500 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                  >
                    👁️ Hiển thị Backup Codes
                  </button>
                )}
                <button
                  onClick={handleRegenerateBackupCodes}
                  disabled={regeneratingCodes}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {regeneratingCodes ? "⏳ Đang tạo..." : "🔄 Tạo lại Backup Codes"}
                </button>
                <p className="text-xs text-slate-500 mt-1">
                  ⚠️ Lưu ý: Tạo lại sẽ vô hiệu hóa tất cả các mã cũ
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phần Xác minh tài khoản với Google Authenticator */}
      <div className="mt-6 rounded-lg border border-slate-100 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Xác minh tài khoản</h2>
        <p className="mt-2 text-sm text-slate-600">
          Chọn phương thức xác minh: Google Authenticator hoặc Backup Code.
        </p>

        {checkingMfa ? (
          <div className="mt-4 text-center text-sm text-slate-500">Đang kiểm tra trạng thái MFA...</div>
        ) : mfaEnabled === false ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 flex-shrink-0 text-amber-600"
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
                <p className="text-sm font-medium text-amber-800">Tài khoản chưa kích hoạt mã Google Authenticator</p>
                <p className="mt-1 text-xs text-amber-700">
                  Vui lòng bật xác thực đa yếu tố ở trên để sử dụng tính năng này.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Radio buttons để chọn phương thức xác minh */}
            <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
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
              <form className="mt-4 space-y-4" onSubmit={handleSubmit(onVerifyGoogleAuthenticator)}>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Mã Google Authenticator</label>
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
                  disabled={verifyingCode}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {verifyingCode ? "Đang xác minh..." : "Xác minh"}
                </button>
              </form>
            )}

            {/* Form Backup Code */}
            {showBackupCodeForm && (
              <form className="mt-4 space-y-4" onSubmit={handleSubmitBackupCode(onVerifyBackupCode)}>
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
                  disabled={verifyingCode}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {verifyingCode ? "Đang xác minh..." : "Xác minh"}
                </button>
              </form>
            )}
          </>
        )}
      </div>

      <div className="mt-4">
        <ErrorAlert message={error} />
      </div>
    </div>
  );
};

export default ProfilePage;

