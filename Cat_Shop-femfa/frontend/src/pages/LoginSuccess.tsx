import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Kiểm tra xem có lỗi không (ví dụ: Admin cố đăng nhập qua Google)
    const error = params.get("error");
    if (error) {
      setErrorMessage(decodeURIComponent(error));
      // Chuyển về trang chủ sau 3 giây
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 3000);
      return;
    }

    // Xử lý cả 2 format: token (cũ) hoặc accessToken + refreshToken (mới từ OAuth2)
    const token = params.get("token");
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    let userRole: string | null = null;

    if (token) {
      // Format cũ: chỉ có token
      localStorage.setItem("authToken", token);
      
      // Lấy role từ token
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userRole = payload.role;
        if (payload.sub) {
          localStorage.setItem("user_email", payload.sub);
        }
      } catch (e) {
        console.error("Không thể parse token:", e);
      }
    } else if (accessToken && refreshToken) {
      // Format mới từ OAuth2: có accessToken và refreshToken
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      
      // Lấy email và role từ accessToken (JWT payload)
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        userRole = payload.role;
        if (payload.sub) {
          localStorage.setItem("user_email", payload.sub);
        }
      } catch (e) {
        console.error("Không thể parse email từ token:", e);
      }
    }

    // Chuyển hướng dựa trên role
    setTimeout(() => {
      // Kiểm tra role và redirect tương ứng
      if (userRole?.toLowerCase() === "admin") {
        // Nếu là admin, chuyển đến trang admin
        navigate("/admin", { replace: true });
      } else {
        // Nếu là user (Customer) hoặc không xác định được role, chuyển về trang chủ
        navigate("/", { replace: true });
      }
      // Reload để cập nhật trạng thái đăng nhập
      window.location.reload();
    }, 500);
  }, [location.search, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="rounded-lg bg-white px-6 py-4 text-center shadow max-w-md">
        {errorMessage ? (
          <>
            <p className="text-sm font-medium text-red-600 mb-2">⛔ {errorMessage}</p>
            <p className="text-xs text-slate-500">Đang chuyển về trang chủ...</p>
          </>
        ) : (
          <p className="text-sm font-medium text-slate-600">Đang hoàn tất đăng nhập Google...</p>
        )}
      </div>
    </div>
  );
};

export default LoginSuccess;

