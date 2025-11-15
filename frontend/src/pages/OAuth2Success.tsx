import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { tokenStorage } from "../authFlow/api/authService";

/**
 * Trang xử lý redirect từ backend sau khi đăng nhập Google thành công
 * Backend redirect về: /oauth2/success?accessToken=...&refreshToken=...&mfaEnabled=...&qrBase64=...
 */
const OAuth2Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const email = params.get("email"); // Backend có thể trả về email trong params
    const mfaEnabled = params.get("mfaEnabled") === "true";
    const qrBase64Param = params.get("qrBase64");

    // Lưu token và email nếu có
    if (accessToken && refreshToken) {
      // Lưu vào authFlow storage
      tokenStorage.setTokens(accessToken, refreshToken);
      // Lưu vào main app storage để dùng cho các API khác
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      
      // Lưu email nếu có trong params, hoặc decode từ token
      let userEmail = email;
      if (!userEmail && accessToken) {
        // Thử decode email từ JWT token (nếu token chứa email)
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          userEmail = payload.email || payload.sub;
        } catch (e) {
          // Nếu không decode được, bỏ qua
        }
      }
      if (userEmail) {
        localStorage.setItem('user_email', userEmail);
      }
    }

    // Nếu có QR code (user mới bật MFA lần đầu) → hiển thị để user quét
    if (qrBase64Param) {
      // Đảm bảo QR code có prefix data:image/png;base64, nếu chưa có
      let qrImage = qrBase64Param;
      if (qrImage && !qrImage.startsWith('data:image')) {
        qrImage = `data:image/png;base64,${qrImage}`;
      }
      setQrBase64(qrImage);
      setShowQr(true);
      return; // Giữ lại trang để user quét QR
    }

    // Nếu không có QR → đăng nhập thành công, chuyển về trang chủ
    if (accessToken) {
      // Reload để cập nhật trạng thái user
      window.location.href = '/';
    } else {
      navigate("/", { replace: true });
    }
  }, [location.search, navigate]);

  // Nếu có QR code → hiển thị form để user quét
  if (showQr && qrBase64) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Quét mã QR để bật MFA</h2>
          <p className="mb-6 text-sm text-slate-500">
            Mở ứng dụng Google Authenticator và quét mã QR bên dưới để hoàn tất thiết lập bảo mật 2 lớp.
          </p>

          <div className="mb-6 flex justify-center rounded-lg bg-gray-50 p-4">
            <img src={qrBase64} alt="MFA QR Code" className="h-64 w-64" />
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Lưu ý:</strong> Sau khi quét mã, bạn sẽ cần nhập mã 6 số từ Google Authenticator mỗi lần đăng nhập.
            </p>
          </div>

          <button
            onClick={() => {
              setShowQr(false);
              // Reload để cập nhật trạng thái user
              window.location.href = '/';
            }}
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Đã quét xong, tiếp tục
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="rounded-lg bg-white px-6 py-4 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-600">Đang hoàn tất đăng nhập Google...</p>
      </div>
    </div>
  );
};

export default OAuth2Success;



