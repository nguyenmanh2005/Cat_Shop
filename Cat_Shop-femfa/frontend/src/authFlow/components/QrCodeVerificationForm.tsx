import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";
import ErrorAlert from "./ErrorAlert";

const QrCodeVerificationForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | undefined>();
  const [email, setEmail] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("authFlow.pendingEmail");
    if (!storedEmail) {
      navigate("/auth-flow/login", { replace: true });
      return;
    }
    setEmail(storedEmail);
    generateQrCode();
  }, [navigate]);

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
      setError("Tính năng QR Code đang được phát triển. Vui lòng sử dụng phương thức khác.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Không thể tạo QR code. Vui lòng thử lại.");
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

  // Polling để kiểm tra trạng thái
  useEffect(() => {
    if (!sessionId || status !== "pending") return;
    const interval = setInterval(checkStatus, 2000);
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
              Quay lại
            </button>
            <h2 className="text-2xl font-semibold text-white mb-2">Xác minh bằng QR Code</h2>
            <p className="text-slate-300 text-sm">
              Quét mã QR bằng ứng dụng di động để xác minh tài khoản
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-4 text-slate-400">Đang tạo QR code...</p>
            </div>
          ) : qrBase64 ? (
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-6 flex items-center justify-center">
                <img src={qrBase64} alt="QR Code" className="w-64 h-64" />
              </div>
              <div className="text-center">
                <p className="text-slate-300 text-sm">
                  Quét mã QR này bằng ứng dụng di động của bạn
                </p>
                {status === "pending" && (
                  <p className="mt-2 text-blue-400 text-sm">Đang chờ xác nhận...</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-700 rounded-lg p-6 text-center">
              <p className="text-slate-300">Vui lòng tạo QR code để tiếp tục</p>
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

