import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { apiService } from "@/services/api";
import { QrCode, Mail, Lock, CheckCircle2, XCircle } from "lucide-react";

const QrLogin = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSessionId, setScannedSessionId] = useState<string | null>(
    searchParams.get("sessionId")
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"scanning" | "login" | "success" | "error">(
    searchParams.get("sessionId") ? "login" : "scanning"
  );

  // Nếu có sessionId từ URL, chuyển thẳng sang form login
  useEffect(() => {
    if (scannedSessionId) {
      setStatus("login");
    }
  }, [scannedSessionId]);

  // Cleanup scanner khi component unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current = null;
          })
          .catch((err) => {
            console.error("Error stopping scanner:", err);
          });
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code scanned successfully
          handleQrScanned(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors (they're normal while scanning)
        }
      );

      setIsScanning(true);
      setStatus("scanning");
    } catch (err: any) {
      console.error("Error starting scanner:", err);
      toast({
        title: "Lỗi khởi động camera",
        description: err.message || "Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.",
        variant: "destructive",
      });
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleQrScanned = async (qrData: string) => {
    try {
      // Stop scanning
      await stopScanning();

      // Validate input length để tránh DoS
      if (qrData.length > 1000) {
        throw new Error("QR code data quá dài, có thể không hợp lệ");
      }

      // Parse QR data (có thể là JSON, URL, hoặc chỉ sessionId)
      let sessionId: string;
      
      // Kiểm tra nếu là URL
      if (qrData.startsWith("http://") || qrData.startsWith("https://")) {
        const url = new URL(qrData);
        sessionId = url.searchParams.get("sessionId") || "";
        if (!sessionId) {
          throw new Error("URL không chứa sessionId");
        }
      } else {
        // Thử parse JSON
        try {
          const parsed = JSON.parse(qrData);
          sessionId = parsed.sessionId || parsed.url?.split("sessionId=")[1]?.split("&")[0] || qrData;
        } catch {
          // Nếu không phải JSON, dùng trực tiếp
          sessionId = qrData;
        }
      }

      // Validate sessionId format (phải bắt đầu bằng "qr_")
      if (!sessionId || !sessionId.startsWith("qr_")) {
        throw new Error("SessionId không hợp lệ hoặc QR code không đúng định dạng");
      }

      // Sanitize sessionId - chỉ cho phép alphanumeric và underscore
      const sanitizedSessionId = sessionId.replace(/[^a-zA-Z0-9_]/g, "");
      if (!sanitizedSessionId || sanitizedSessionId !== sessionId) {
        throw new Error("SessionId chứa ký tự không hợp lệ");
      }

      setScannedSessionId(sanitizedSessionId);
      setStatus("login");
      
      toast({
        title: "Quét QR thành công!",
        description: "Vui lòng nhập thông tin đăng nhập",
      });
    } catch (error: any) {
      console.error("Error parsing QR:", error);
      toast({
        title: "Lỗi xử lý QR code",
        description: error.message || "QR code không hợp lệ. Vui lòng thử lại.",
        variant: "destructive",
      });
      // Restart scanning
      setTimeout(() => {
        startScanning();
      }, 1000);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!scannedSessionId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng quét QR code trước",
        variant: "destructive",
      });
      return;
    }

    if (!email || !password) {
      toast({
        title: "Thông tin không đầy đủ",
        description: "Vui lòng nhập email và mật khẩu",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Email không hợp lệ",
        description: "Vui lòng nhập đúng định dạng email",
        variant: "destructive",
      });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      toast({
        title: "Mật khẩu quá ngắn",
        description: "Mật khẩu phải có ít nhất 6 ký tự",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Get device ID using FingerprintJS
      const { getOrCreateDeviceFingerprint } = await import('@/utils/deviceFingerprint');
      const deviceId = await getOrCreateDeviceFingerprint();

      // Call confirm endpoint
      const response = await apiService.post<{ message: string }>(
        '/auth/qr/confirm',
        {
          sessionId: scannedSessionId,
          email,
          password,
          deviceId,
        }
      );

      setStatus("success");
      toast({
        title: "Đăng nhập thành công!",
        description: "Bạn có thể quay lại trình duyệt trên máy tính",
      });

      // Show success message for 3 seconds then redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (error: any) {
      console.error("Login error:", error);
      setStatus("error");
      const errorMessage = error.response?.data?.message || error.message || "Đăng nhập thất bại";
      toast({
        title: "Đăng nhập thất bại",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setScannedSessionId(null);
    setEmail("");
    setPassword("");
    setStatus("scanning");
    startScanning();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Đăng nhập bằng QR Code</CardTitle>
          <CardDescription>
            {status === "scanning" && "Quét mã QR từ máy tính để đăng nhập"}
            {status === "login" && "Nhập thông tin đăng nhập của bạn"}
            {status === "success" && "Đăng nhập thành công!"}
            {status === "error" && "Đăng nhập thất bại"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "scanning" && (
            <div className="space-y-4">
              <div id="qr-reader" className="w-full rounded-lg overflow-hidden bg-black"></div>
              {!isScanning && (
                <Button onClick={startScanning} className="w-full" size="lg">
                  Bắt đầu quét QR
                </Button>
              )}
              {isScanning && (
                <Button onClick={stopScanning} variant="outline" className="w-full">
                  Dừng quét
                </Button>
              )}
            </div>
          )}

          {status === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isSubmitting}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Ẩn" : "Hiện"}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận đăng nhập"}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset} disabled={isSubmitting}>
                  Quét lại
                </Button>
              </div>
            </form>
          )}

          {status === "success" && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-green-600">Đăng nhập thành công!</p>
              <p className="text-sm text-muted-foreground">
                Bạn có thể quay lại trình duyệt trên máy tính
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-lg font-semibold text-red-600">Đăng nhập thất bại</p>
              <Button onClick={handleReset} className="w-full">
                Thử lại
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QrLogin;

