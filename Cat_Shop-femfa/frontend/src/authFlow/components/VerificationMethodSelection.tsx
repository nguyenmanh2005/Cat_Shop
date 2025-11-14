import { useState } from "react";
import { useNavigate } from "react-router-dom";

type VerificationMethod = "email-otp" | "qr-code" | "google-authenticator" | null;

const VerificationMethodSelection = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod>(null);

  const handleMethodSelect = (method: VerificationMethod) => {
    setSelectedMethod(method);
    
    // Lấy email từ sessionStorage
    const email = sessionStorage.getItem("authFlow.pendingEmail");
    const deviceId = sessionStorage.getItem("authFlow.pendingDeviceId");

    if (!email) {
      navigate("/auth-flow/login", { replace: true });
      return;
    }

    // Điều hướng đến form tương ứng
    switch (method) {
      case "email-otp":
        navigate("/auth-flow/verify/email-otp", { replace: true });
        break;
      case "qr-code":
        navigate("/auth-flow/verify/qr-code", { replace: true });
        break;
      case "google-authenticator":
        navigate("/auth-flow/verify/google-authenticator", { replace: true });
        break;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Secure Access */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700 p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg border-2 border-white/30 flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="h-32 w-32 rounded-lg border-2 border-white/30 flex items-center justify-center">
              <svg className="h-20 w-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-white tracking-tight">SECURE ACCESS</h2>
            <p className="text-white/80 text-sm">Chọn phương thức xác minh</p>
          </div>
        </div>
      </div>

      {/* Right side - Account Verification */}
      <div className="flex-1 bg-slate-800 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Xác minh tài khoản</h1>
                <p className="text-slate-300 text-sm">
                  Vui lòng chọn phương thức xác minh để tiếp tục đăng nhập
                </p>
              </div>
              <button
                onClick={() => navigate("/auth-flow/login")}
                className="h-8 w-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
              >
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Verification Methods */}
            <div className="space-y-3">
              {/* Email OTP */}
              <button
                onClick={() => handleMethodSelect("email-otp")}
                className="w-full bg-slate-700 hover:bg-slate-600 rounded-lg p-4 flex items-center gap-4 transition-colors border border-slate-600 hover:border-blue-500"
              >
                <div className="h-12 w-12 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-semibold mb-1">Xác minh bằng Email OTP</h3>
                  <p className="text-slate-400 text-sm">Nhận mã OTP qua email</p>
                </div>
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* QR Code */}
              <button
                onClick={() => handleMethodSelect("qr-code")}
                className="w-full bg-slate-700 hover:bg-slate-600 rounded-lg p-4 flex items-center gap-4 transition-colors border border-slate-600 hover:border-green-500"
              >
                <div className="h-12 w-12 rounded-lg bg-green-500/20 border border-green-500/50 flex items-center justify-center flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-semibold mb-1">Xác minh bằng QR Code</h3>
                  <p className="text-slate-400 text-sm">Quét mã QR bằng ứng dụng di động</p>
                </div>
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Google Authenticator */}
              <button
                onClick={() => handleMethodSelect("google-authenticator")}
                className="w-full bg-slate-700 hover:bg-slate-600 rounded-lg p-4 flex items-center gap-4 transition-colors border border-slate-600 hover:border-purple-500"
              >
                <div className="h-12 w-12 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center flex-shrink-0">
                  <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-semibold mb-1">Xác minh bằng Google Authenticator</h3>
                  <p className="text-slate-400 text-sm">Nhập mã từ ứng dụng Google Authenticator</p>
                </div>
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Back to login button */}
            <button
              onClick={() => navigate("/auth-flow/login")}
              className="w-full text-slate-300 hover:text-white text-sm font-medium transition-colors py-2"
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationMethodSelection;

