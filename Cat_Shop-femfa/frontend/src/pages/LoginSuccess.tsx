import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    // Lưu token trả về từ đăng nhập Google và chuyển hướng về trang chủ
    if (token) {
      localStorage.setItem("authToken", token);
    }

    navigate("/", { replace: true });
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

