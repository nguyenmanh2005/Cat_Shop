import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService, tokenStorage } from "../api/authService";
import ErrorAlert from "./ErrorAlert";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [error, setError] = useState<string | undefined>();

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

  const maskedToken = useMemo(
    () =>
      accessToken
        ? `${accessToken.slice(0, 12)}...${accessToken.slice(-8)}`
        : "Không tìm thấy accessToken. Vui lòng đăng nhập lại.",
    [accessToken],
  );

  // Yêu cầu backend tạo mã QR để bật MFA
  const handleEnableMfa = async () => {
    try {
      setError(undefined);
      setLoadingQr(true);
      setQrBase64(null);
      const data = await authService.enableMfa();
      setQrBase64(data.qrBase64);
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

      <div className="mt-4">
        <ErrorAlert message={error} />
      </div>
    </div>
  );
};

export default ProfilePage;

