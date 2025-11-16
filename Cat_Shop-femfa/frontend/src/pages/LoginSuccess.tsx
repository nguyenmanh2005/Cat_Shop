import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processOAuthLogin = async () => {
      try {
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
        }

        // Đợi một chút để đảm bảo tokens đã được lưu vào localStorage
        await new Promise(resolve => setTimeout(resolve, 200));

        // Dispatch custom event để trigger AuthContext check lại
        window.dispatchEvent(new Event('auth-tokens-updated'));
        
        // Đợi thêm một chút để AuthContext kịp hydrate user
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Chuyển hướng về trang profile sau khi lưu token (nếu đăng nhập bằng Google OAuth)
        // Nếu không phải OAuth, chuyển về trang chủ
        const loginMethod = params.get("loginMethod");
        const redirectPath = loginMethod === "google" ? "/profile" : "/";
        
        setIsProcessing(false);
        
        // Navigate và reload để đảm bảo AuthContext được refresh hoàn toàn
        navigate(redirectPath, { replace: true });
        
        // Reload sau khi navigate để đảm bảo tất cả state được refresh
        setTimeout(() => {
          window.location.reload();
        }, 200);
      } catch (error) {
        console.error("Error processing OAuth login:", error);
        setIsProcessing(false);
        navigate("/", { replace: true });
      }
    };

    processOAuthLogin();
  }, [location.search, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="rounded-lg bg-white px-6 py-4 text-center shadow">
        <p className="text-sm font-medium text-slate-600">
          {isProcessing ? "Đang hoàn tất đăng nhập Google..." : "Đang chuyển hướng..."}
        </p>
        {user && (
          <p className="text-xs text-green-600 mt-2">
            Đăng nhập thành công: {user.email}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginSuccess;

