import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authService, tokenStorage } from "../api/authService";
import ErrorAlert from "./ErrorAlert";

type GoogleAuthenticatorFormValues = {
  code: string;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [checkingMfa, setCheckingMfa] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GoogleAuthenticatorFormValues>();

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
        </div>
      </div>

      {/* Phần Xác minh tài khoản với Google Authenticator */}
      <div className="mt-6 rounded-lg border border-slate-100 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Xác minh tài khoản</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sử dụng Google Authenticator để xác minh tài khoản của bạn.
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
      </div>

      <div className="mt-4">
        <ErrorAlert message={error} />
      </div>
    </div>
  );
};

export default ProfilePage;

