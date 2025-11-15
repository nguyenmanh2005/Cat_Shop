import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { tokenStorage } from "../api/authService";

/**
 * Trang xử lý redirect từ OAuth2 Google
 * Backend redirect về: /oauth2/success?accessToken=...&refreshToken=...&mfaEnabled=true&qrBase64=...
 */
const OAuth2Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const mfaEnabledParam = params.get("mfaEnabled");
    const qrBase64Param = params.get("qrBase64");

    // Lưu token vào localStorage
    if (accessToken && refreshToken) {
      tokenStorage.setTokens(accessToken, refreshToken);
    }

    // Xử lý MFA nếu có
    if (mfaEnabledParam === "true") {
      setMfaEnabled(true);
      if (qrBase64Param) {
        setQrBase64(qrBase64Param);
      }
      // Nếu có QR code, hiển thị cho user quét, sau đó redirect
      // Nếu không có QR (user đã bật MFA trước đó), redirect luôn
      if (!qrBase64Param) {
        setTimeout(() => {
          navigate("/auth-flow/profile", { replace: true });
        }, 2000);
      }
    } else {
      // Không có MFA → redirect luôn
      navigate("/auth-flow/profile", { replace: true });
    }
  }, [location.search, navigate]);

  // Nếu có QR code → hiển thị để user quét
  if (qrBase64) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Quét mã QR để bật MFA</h2>
          <p className="mb-6 text-sm text-slate-500">
            Mở ứng dụng Google Authenticator và quét mã QR bên dưới để hoàn tất đăng nhập.
          </p>
          <div className="mb-6 flex justify-center rounded-lg border border-slate-100 bg-slate-50 p-4">
            <img src={qrBase64} alt="QR MFA" className="h-64 w-64 object-contain" />
          </div>
          <button
            onClick={() => navigate("/auth-flow/profile", { replace: true })}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Đã quét xong, tiếp tục
          </button>
        </div>
      </div>
    );
  }

  // Đang xử lý...
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="rounded-lg bg-white px-6 py-4 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-600">Đang hoàn tất đăng nhập Google...</p>
      </div>
    </div>
  );
};

export default OAuth2Success;

