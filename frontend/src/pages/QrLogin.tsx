import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Kiểm tra xem đã đăng nhập trên mobile chưa
  const [status, setStatus] = useState<"scanning" | "confirm" | "not-logged-in" | "success" | "error">(
    searchParams.get("sessionId") ? "confirm" : "scanning"
  );

  // Kiểm tra xem user đã đăng nhập trên mobile chưa
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const userEmail = localStorage.getItem('user_email');
    
    if (accessToken && userEmail) {
      setIsLoggedIn(true);
      setEmail(userEmail);
    }
  }, []);

  // Nếu có sessionId từ URL, chuyển thẳng sang confirm hoặc yêu cầu đăng nhập
  useEffect(() => {
    if (scannedSessionId) {
      // Nếu đã đăng nhập, chuyển sang confirm (chỉ cần click)
      // Nếu chưa đăng nhập, yêu cầu đăng nhập trước
      setStatus(isLoggedIn ? "confirm" : "not-logged-in");
    }
  }, [scannedSessionId, isLoggedIn]);

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

      if (!sessionId) {
        throw new Error("Không tìm thấy sessionId trong QR code");
      }

      setScannedSessionId(sessionId);
      // Nếu đã đăng nhập, chuyển sang confirm (chỉ cần click)
      // Nếu chưa đăng nhập, yêu cầu đăng nhập trước
      setStatus(isLoggedIn ? "confirm" : "not-logged-in");
      
      if (isLoggedIn) {
        toast({
          title: "Quét QR thành công!",
          description: "Nhấn xác nhận để đăng nhập",
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

  // Xác nhận đăng nhập bằng token (nếu đã đăng nhập trên mobile)
  const handleConfirmWithToken = async () => {
    if (!scannedSessionId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng quét QR code trước",
        variant: "destructive",
      });
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      // Nếu không có token, chuyển sang form nhập email/password
      setStatus("login");
      return;
    }

    try {
      setIsSubmitting(true);

      // Get device ID
      const getOrCreateDeviceId = (): string => {
        const DEVICE_ID_STORAGE_KEY = 'cat_shop_device_id';
        let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
        if (!deviceId) {
          deviceId = crypto.randomUUID();
          localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
        }
        return deviceId;
      };

      const deviceId = getOrCreateDeviceId();

      // Call confirm endpoint với token
      const response = await apiService.post<{ message: string }>(
        '/auth/qr/confirm',
        {
          sessionId: scannedSessionId,
          accessToken,
          deviceId,
        }
      );

      setStatus("success");
      toast({
        title: "Đăng nhập thành công!",
        description: "Máy tính sẽ tự động đăng nhập. Bạn có thể đóng trang này.",
      });

      // Không redirect - để user thấy thông báo thành công
      // Máy tính sẽ tự động đăng nhập nhờ polling trong LoginForm
      console.log("✅ QR Login confirmed successfully. Desktop will auto-login via polling.");
      console.log("📱 Mobile device should NOT redirect - staying on QR login page.");
    } catch (error: any) {
      console.error("Confirm error:", error);
      setStatus("error");
      const errorMessage = error.response?.data?.message || error.message || "Xác nhận thất bại";
      toast({
        title: "Xác nhận thất bại",
        description: errorMessage,
        variant: "destructive",
      });
      // Nếu token không hợp lệ, yêu cầu đăng nhập lại
      if (errorMessage.includes("token") || errorMessage.includes("Token")) {
        setIsLoggedIn(false);
        setStatus("not-logged-in");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setScannedSessionId(null);
    setStatus("scanning");
    startScanning();
  };

  const handleReset = () => {
    setScannedSessionId(null);
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
            {status === "confirm" && "Bạn có muốn đăng nhập trên máy tính không?"}
            {status === "not-logged-in" && "Vui lòng đăng nhập trên mobile trước"}
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

          {status === "confirm" && (
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <QrCode className="h-10 w-10 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Tài khoản:
                  </p>
                  <p className="font-semibold text-xl">{email}</p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Bạn có muốn đăng nhập trên máy tính không?
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleCancel} 
                  variant="outline" 
                  className="flex-1" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  Không
                </Button>
                <Button 
                  onClick={handleConfirmWithToken} 
                  className="flex-1" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Có"}
                </Button>
              </div>
            </div>
          )}

          {status === "not-logged-in" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                <Lock className="h-10 w-10 text-yellow-600" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-lg">Bạn chưa đăng nhập</p>
                <p className="text-sm text-muted-foreground">
                  Vui lòng đăng nhập trên mobile trước khi quét QR code
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleReset} 
                  variant="outline" 
                  className="flex-1"
                >
                  Quét lại
                </Button>
                <Button 
                  onClick={() => window.location.href = "/"} 
                  className="flex-1"
                >
                  Đăng nhập ngay
                </Button>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-green-600">Đăng nhập thành công!</p>
              <p className="text-sm text-muted-foreground">
                Máy tính sẽ tự động đăng nhập
              </p>
              <p className="text-xs text-muted-foreground">
                Bạn có thể đóng trang này và quay lại máy tính
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

