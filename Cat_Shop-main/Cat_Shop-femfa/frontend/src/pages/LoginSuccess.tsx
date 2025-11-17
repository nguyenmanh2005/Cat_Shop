import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Xử lý cả 2 format: token (cũ) hoặc accessToken + refreshToken (mới từ OAuth2)
    const token = params.get("token");
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (token) {
      // Format cũ: chỉ có token
      localStorage.setItem("authToken", token);
    } else if (accessToken && refreshToken) {
      // Format mới từ OAuth2: có accessToken và refreshToken
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      
      // Lấy email từ accessToken (JWT payload)
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        if (payload.sub) {
          localStorage.setItem("user_email", payload.sub);
        }
      } catch (e) {
        console.error("Không thể parse email từ token:", e);
      }
      
      console.log("✅ Google OAuth tokens saved:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        email: localStorage.getItem("user_email")
      });
    }

    // Chuyển hướng về trang người dùng sau khi lưu token
    // Đợi một chút để đảm bảo token được lưu và AuthContext có thời gian hydrate user
    setTimeout(() => {
      navigate("/profile", { replace: true });
      // Reload để cập nhật trạng thái đăng nhập và hydrate user trong AuthContext
      window.location.reload();
    }, 1000);
  }, [location.search, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="rounded-lg bg-white px-6 py-4 text-center shadow">
        <p className="text-sm font-medium text-slate-600">Đang hoàn tất đăng nhập Google...</p>
      </div>
    </div>
  );
};

export default LoginSuccess;

