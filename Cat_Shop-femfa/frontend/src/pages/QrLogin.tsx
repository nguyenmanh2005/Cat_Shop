import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { apiService, api } from "@/services/api";
import { decodeJwtPayload } from "@/utils/jwt";
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
  const [status, setStatus] = useState<"scanning" | "login" | "success" | "error" | "processing">(
    searchParams.get("sessionId") ? "login" : "scanning"
  );

  const isLoggedIn = !!localStorage.getItem("access_token");

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

      // Nếu đã đăng nhập sẵn trên điện thoại → xác nhận luôn bằng access token (giống Zalo)
      if (isLoggedIn) {
        setStatus("processing");
        try {
          // Kiểm tra access token có hợp lệ không trước khi gửi
          let accessToken = localStorage.getItem("access_token");
          if (!accessToken || accessToken.trim() === "") {
            // Không có token, chuyển sang form login
            setStatus("login");
            toast({
              title: "Phiên đăng nhập đã hết hạn",
              description: "Vui lòng nhập thông tin đăng nhập để tiếp tục",
            });
            return;
          }
          
          // Kiểm tra token có hết hạn không
          const payload = decodeJwtPayload(accessToken);
          if (payload && payload.exp) {
            const expirationTime = (payload.exp as number) * 1000; // Convert to milliseconds
            const currentTime = Date.now();
            const timeUntilExpiry = expirationTime - currentTime;
            
            // Nếu token hết hạn trong vòng 5 phút, thử refresh
            if (timeUntilExpiry < 0) {
              console.log("⏰ Token đã hết hạn, thử refresh...");
              try {
                const newToken = await authService.refreshToken();
                console.log("✅ Token đã được refresh thành công");
                // Đảm bảo token mới được lưu
                accessToken = localStorage.getItem("access_token");
                if (!accessToken) {
                  throw new Error("Token không được lưu sau khi refresh");
                }
              } catch (refreshError: any) {
                console.error("❌ Không thể refresh token:", refreshError);
                // Refresh thất bại, chuyển sang form login
                setStatus("login");
                toast({
                  title: "Phiên đăng nhập đã hết hạn",
                  description: "Vui lòng nhập thông tin đăng nhập để tiếp tục",
                });
                return;
              }
            } else if (timeUntilExpiry < 5 * 60 * 1000) {
              // Token sắp hết hạn (trong 5 phút), refresh trước
              console.log("⏰ Token sắp hết hạn, refresh trước...");
              try {
                const newToken = await authService.refreshToken();
                console.log("✅ Token đã được refresh thành công");
                // Đảm bảo token mới được lưu
                accessToken = localStorage.getItem("access_token");
              } catch (refreshError: any) {
                console.warn("⚠️ Không thể refresh token, tiếp tục với token hiện tại:", refreshError);
              }
            }
          }
          
          // Đảm bảo token mới nhất được lưu
          const latestToken = localStorage.getItem("access_token");
          if (!latestToken) {
            console.warn("⚠️ [QR-LOGIN] No access token after refresh, switching to login form");
            setStatus("login");
            toast({
              title: "Phiên đăng nhập đã hết hạn",
              description: "Vui lòng nhập thông tin đăng nhập để tiếp tục",
            });
            return;
          }
          
          console.log("📱 [QR-LOGIN] Calling confirm-token with sessionId:", sanitizedSessionId);
          console.log("📱 [QR-LOGIN] Has access token:", !!latestToken);
          console.log("📱 [QR-LOGIN] Token preview:", latestToken.substring(0, 20) + "...");
          
          // Gọi confirm với token (đã được refresh nếu cần)
          // Nếu lỗi 400 về token, sẽ được catch và chuyển sang form login
          await authService.confirmQrLoginWithToken(sanitizedSessionId);
          setStatus("success");
          toast({
            title: "Đã cho phép đăng nhập trên thiết bị khác",
            description: "Vui lòng quay lại trình duyệt trên máy tính của bạn",
          });

          // Sau 3 giây quay về trang chủ / đóng tab
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        } catch (error: any) {
          console.error("Error confirming QR with token:", error);
          
          // Xử lý các loại lỗi khác nhau
          const isTokenError = error.message?.includes("Access token không hợp lệ") || 
                              error.message?.includes("không được cung cấp") ||
                              error.message?.includes("không tồn tại") ||
                              error.message?.includes("hết hạn") ||
                              error.response?.status === 401 ||
                              error.response?.status === 400;
          
          if (isTokenError) {
            // Token không hợp lệ hoặc hết hạn → chuyển sang form login thay vì báo lỗi
            setStatus("login");
            toast({
              title: "Phiên đăng nhập đã hết hạn",
              description: "Vui lòng nhập thông tin đăng nhập để tiếp tục",
            });
          } else {
            // Lỗi khác (session không hợp lệ, network error, etc.)
            setStatus("error");
            let errorMessage = "Vui lòng thử lại hoặc đăng nhập lại trên điện thoại.";
            if (error.message) {
              errorMessage = error.message;
            }
            
            toast({
              title: "Không thể xác nhận đăng nhập",
              description: errorMessage,
              variant: "destructive",
            });
          }
        }
      } else {
        // Chưa đăng nhập trên điện thoại → yêu cầu nhập email/mật khẩu (flow cũ)
        setStatus("login");
        toast({
          title: "Quét QR thành công!",
          description: "Vui lòng nhập thông tin đăng nhập",
        });
      }
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
      setStatus("processing");

      // Xóa token cũ nếu có (tránh xung đột với token hết hạn)
      const oldToken = localStorage.getItem("access_token");
      if (oldToken) {
        console.log("Removing old expired token before QR confirm");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_email");
      }

      // Get device ID using FingerprintJS
      const { getOrCreateDeviceFingerprint } = await import('@/utils/deviceFingerprint');
      const deviceId = await getOrCreateDeviceFingerprint();

      // Call confirm endpoint (public endpoint, không cần token)
      // apiService sẽ tự động xóa Authorization header cho public endpoints
      console.log('📱 [QR-LOGIN] Calling /auth/qr/confirm with:', {
        sessionId: scannedSessionId,
        email,
        hasPassword: !!password,
        deviceId,
        hasOldToken: !!oldToken
      });
      
      const response = await apiService.post<{ message: string }>(
        '/auth/qr/confirm',
        {
          sessionId: scannedSessionId,
          email,
          password,
          deviceId,
        }
      );
      
      console.log('✅ [QR-LOGIN] Confirm response:', response);

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
      
      // Xử lý các loại lỗi khác nhau
      let errorMessage = "Đăng nhập thất bại";
      
      if (error.response?.data) {
        // Backend trả về ApiResponse
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Kiểm tra nếu là lỗi về token, chuyển sang form login
      if (errorMessage.includes("token") || errorMessage.includes("Token") || 
          error.response?.status === 401) {
        errorMessage = "Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại email và mật khẩu.";
      }
      
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
              <div className="flex gap-2">
                <Button onClick={handleReset} className="flex-1">
                  Thử lại
                </Button>
                <Button onClick={() => setStatus("login")} variant="outline" className="flex-1">
                  Nhập thông tin đăng nhập
                </Button>
              </div>
            </div>
          )}
          
          {status === "processing" && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-spin">
                <QrCode className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-lg font-semibold">Đang xử lý...</p>
              <p className="text-sm text-muted-foreground">
                Vui lòng chờ trong giây lát
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QrLogin;

