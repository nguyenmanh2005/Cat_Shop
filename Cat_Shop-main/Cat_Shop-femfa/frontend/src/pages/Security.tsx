import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Key, Download, RefreshCw, Eye, EyeOff, Lock, Smartphone, Trash2, AlertTriangle, Clock, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { userService } from "@/services/userService";
import { deviceService } from "@/services/deviceService";
import { TrustedDevice } from "@/types";

type GoogleAuthenticatorFormValues = {
  code: string;
};

const Security = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [checkingMfa, setCheckingMfa] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [remainingBackupCodes, setRemainingBackupCodes] = useState<number>(0);
  const [regeneratingCodes, setRegeneratingCodes] = useState(false);
  
  // Đổi mật khẩu states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Quản lý thiết bị states
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  
  // Cảnh báo bảo mật states
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GoogleAuthenticatorFormValues>();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    if (user?.email) {
      checkMfaStatus();
      loadDevices();
      loadSecurityAlerts();
      
      // Lấy deviceId hiện tại từ localStorage
      const DEVICE_ID_STORAGE_KEY = 'cat_shop_device_id';
      const deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
      setCurrentDeviceId(deviceId);
    }
  }, [isAuthenticated, user, navigate]);

  // Kiểm tra trạng thái MFA
  const checkMfaStatus = async () => {
    if (!user?.email) return;
    try {
      setCheckingMfa(true);
      const data = await apiService.get<{ mfaEnabled: boolean; remainingBackupCodes?: number }>(
        "/auth/mfa/status",
        { params: { email: user.email } }
      );
      setMfaEnabled(data.mfaEnabled);
      if (data.remainingBackupCodes !== undefined) {
        setRemainingBackupCodes(data.remainingBackupCodes);
      }
    } catch (err) {
      console.error("Không thể kiểm tra trạng thái MFA:", err);
      setMfaEnabled(false);
    } finally {
      setCheckingMfa(false);
    }
  };

  // Bật MFA
  const handleEnableMfa = async () => {
    if (!user?.email) {
      setError("Không tìm thấy email. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      setError(undefined);
      setLoadingQr(true);
      setQrBase64(null);
      const data = await apiService.post<{
        qrBase64: string;
        backupCodes?: string[];
        backupCodesCount?: number;
      }>("/auth/mfa/enable", null, {
        params: { email: user.email },
      });
      
      // Kiểm tra xem có QR code không
      if (!data.qrBase64) {
        throw new Error("Không nhận được QR code từ server");
      }
      
      setQrBase64(data.qrBase64);
      if (data.backupCodes && Array.isArray(data.backupCodes)) {
        setBackupCodes(data.backupCodes);
        setShowBackupCodes(true);
        setRemainingBackupCodes(data.backupCodes.length);
      }
      setMfaEnabled(true);
      toast({
        title: "Thành công",
        description: "MFA đã được bật. Vui lòng quét QR code và lưu backup codes.",
      });
    } catch (err: any) {
      console.error("Lỗi khi bật MFA:", err);
      let errorMessage = "Không thể bật MFA. Vui lòng thử lại.";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingQr(false);
    }
  };

  // Hiển thị lại QR code từ mfaSecret hiện có
  const handleShowQrCode = async () => {
    if (!user?.email) {
      setError("Không tìm thấy email. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      setError(undefined);
      setLoadingQr(true);
      const data = await apiService.get<{ qrBase64: string }>(
        "/auth/mfa/qr/base64",
        { params: { email: user.email } }
      );
      
      if (!data.qrBase64) {
        throw new Error("Không nhận được QR code từ server");
      }
      
      setQrBase64(data.qrBase64);
      toast({
        title: "Thành công",
        description: "QR code đã được hiển thị. Bạn có thể quét lại bằng ứng dụng Google Authenticator.",
      });
    } catch (err: any) {
      console.error("Lỗi khi lấy QR code:", err);
      let errorMessage = "Không thể lấy QR code. Vui lòng thử lại.";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingQr(false);
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới phải có ít nhất 6 ký tự",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp");
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới và xác nhận mật khẩu không khớp",
        variant: "destructive",
      });
      return;
    }

    try {
      setError(undefined);
      setChangingPassword(true);
      await userService.changePassword(currentPassword, newPassword);
      
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
      
      toast({
        title: "Thành công",
        description: "Đổi mật khẩu thành công",
      });
    } catch (err: any) {
      console.error("Lỗi khi đổi mật khẩu:", err);
      let errorMessage = "Không thể đổi mật khẩu. Vui lòng thử lại.";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Load danh sách thiết bị
  const loadDevices = async () => {
    if (!user?.email) return;
    try {
      setLoadingDevices(true);
      const data = await deviceService.getUserDevices(user.email);
      setDevices(data || []);
    } catch (err) {
      console.error("Không thể tải danh sách thiết bị:", err);
      setDevices([]);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thiết bị. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoadingDevices(false);
    }
  };

  // Xóa một thiết bị
  const handleRemoveDevice = async (deviceId: number) => {
    if (!user?.email) return;
    
    if (!window.confirm("Bạn có chắc muốn xóa thiết bị này? Bạn sẽ cần đăng nhập lại trên thiết bị này.")) {
      return;
    }

    try {
      await deviceService.removeDevice(deviceId, user.email);
      toast({
        title: "Thành công",
        description: "Thiết bị đã được xóa",
      });
      await loadDevices();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Không thể xóa thiết bị";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Xóa tất cả thiết bị (trừ thiết bị hiện tại)
  const handleRemoveAllDevices = async () => {
    if (!user?.email) return;
    
    if (!window.confirm("Bạn có chắc muốn xóa tất cả thiết bị? Bạn sẽ cần đăng nhập lại trên tất cả thiết bị (trừ thiết bị hiện tại).")) {
      return;
    }

    try {
      await deviceService.removeAllDevices(user.email);
      toast({
        title: "Thành công",
        description: "Tất cả thiết bị đã được xóa",
      });
      await loadDevices();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Không thể xóa thiết bị";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Load cảnh báo bảo mật
  const loadSecurityAlerts = async () => {
    if (!user?.email) return;
    
    // Tạo danh sách cảnh báo từ dữ liệu thiết bị
    try {
      const deviceData = await deviceService.getUserDevices(user.email);
      
      const alerts: any[] = [];
      const now = new Date();
      
      // Kiểm tra thiết bị mới (đăng nhập trong 24h qua)
      deviceData?.forEach((device: TrustedDevice) => {
        if (device.lastLogin) {
          const lastLogin = new Date(device.lastLogin);
          const hoursAgo = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
          
          if (hoursAgo < 24) {
            alerts.push({
              type: "new_device",
              message: `Đăng nhập từ thiết bị mới: ${device.userAgent || 'Thiết bị không xác định'}`,
              time: device.lastLogin,
              ip: device.ipAddress,
            });
          }
        }
      });
      
      setSecurityAlerts(alerts);
    } catch (err) {
      console.error("Không thể tải cảnh báo bảo mật:", err);
      setSecurityAlerts([]);
    }
  };

  // Format thời gian
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  // Parse user agent để lấy tên thiết bị
  const parseUserAgent = (userAgent?: string | null) => {
    if (!userAgent) return "Thiết bị không xác định";
    
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac")) return "Mac";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "iOS";
    
    return userAgent.substring(0, 50) + (userAgent.length > 50 ? "..." : "");
  };

  // Tắt MFA
  const handleDisableMfa = async () => {
    if (!user?.email) {
      setError("Không tìm thấy email. Vui lòng đăng nhập lại.");
      return;
    }

    // Xác nhận trước khi tắt
    const confirmed = window.confirm(
      "Bạn có chắc muốn tắt Google Authenticator (MFA)?\n\n" +
      "⚠️ Cảnh báo:\n" +
      "• Tất cả backup codes sẽ bị xóa\n" +
      "• Tài khoản của bạn sẽ kém an toàn hơn\n" +
      "• Bạn sẽ cần bật lại MFA và quét QR code mới nếu muốn sử dụng lại"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(undefined);
      await apiService.post<string>("/auth/mfa/disable", null, {
        params: { email: user.email },
      });
      
      // Reset state
      setMfaEnabled(false);
      setQrBase64(null);
      setBackupCodes([]);
      setShowBackupCodes(false);
      setRemainingBackupCodes(0);
      
      toast({
        title: "Thành công",
        description: "MFA đã được tắt. Tài khoản của bạn không còn yêu cầu xác minh 2 bước.",
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Không thể tắt MFA. Vui lòng thử lại.");
    }
  };

  // Tạo lại backup codes
  const handleRegenerateBackupCodes = async () => {
    if (!user?.email) {
      setError("Không tìm thấy email. Vui lòng đăng nhập lại.");
      return;
    }
    if (!window.confirm("Bạn có chắc muốn tạo lại backup codes? Các mã cũ sẽ bị vô hiệu hóa.")) {
      return;
    }
    try {
      setError(undefined);
      setRegeneratingCodes(true);
      const data = await apiService.post<{ backupCodes: string[]; count: number; message: string }>(
        "/auth/mfa/backup-codes/regenerate",
        null,
        { params: { email: user.email } }
      );
      setBackupCodes(data.backupCodes);
      setShowBackupCodes(true);
      setRemainingBackupCodes(data.backupCodes.length);
      toast({
        title: "Thành công",
        description: "Backup codes đã được tạo lại. Vui lòng lưu các mã mới.",
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Không thể tạo lại backup codes. Vui lòng thử lại.");
    } finally {
      setRegeneratingCodes(false);
    }
  };

  // Xác minh Google Authenticator (chỉ chấp nhận mã 6 số, KHÔNG chấp nhận backup code)
  const onVerifyGoogleAuthenticator = async ({ code }: GoogleAuthenticatorFormValues) => {
    if (!user?.email) {
      setError("Không tìm thấy email. Vui lòng đăng nhập lại.");
      return;
    }

    // Chỉ chấp nhận mã 6 số từ Google Authenticator
    if (!/^\d{6}$/.test(code)) {
      setError("Mã phải là 6 chữ số từ Google Authenticator");
      return;
    }

    try {
      setError(undefined);
      setVerifyingCode(true);
      
      // Lấy deviceId từ localStorage
      const DEVICE_ID_STORAGE_KEY = 'cat_shop_device_id';
      const deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY) || crypto.randomUUID();
      
      await apiService.post("/auth/mfa/verify", {
        email: user.email,
        code,
        deviceId,
      });
      reset();
      toast({
        title: "Thành công",
        description: "Xác minh Google Authenticator thành công!",
      });
      await checkMfaStatus();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Mã Google Authenticator không chính xác, vui lòng thử lại.");
    } finally {
      setVerifyingCode(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Bảo mật tài khoản
            </h1>
            <p className="text-muted-foreground">
              Quản lý xác thực đa yếu tố (MFA) và backup codes
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Đổi mật khẩu Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Đổi mật khẩu
              </CardTitle>
              <CardDescription>
                Thay đổi mật khẩu để bảo vệ tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showChangePassword ? (
                <Button
                  variant="outline"
                  onClick={() => setShowChangePassword(true)}
                  className="w-full"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Đổi mật khẩu
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Nhập mật khẩu hiện tại"
                        className="pr-10"
                        disabled={changingPassword}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        className="pr-10"
                        disabled={changingPassword}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        className="pr-10"
                        disabled={changingPassword}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="flex-1"
                    >
                      {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowChangePassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setError(undefined);
                      }}
                      disabled={changingPassword}
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Google Authenticator Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Google Authenticator (MFA)
              </CardTitle>
              <CardDescription>
                Bật xác thực đa yếu tố để bảo vệ tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkingMfa ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                  <p className="mt-4 text-sm text-muted-foreground">Đang kiểm tra trạng thái MFA...</p>
                </div>
              ) : mfaEnabled === false ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                      MFA chưa được bật. Nhấn nút bên dưới để bật và quét QR code bằng ứng dụng Google Authenticator.
                    </p>
                  </div>
                  <Button onClick={handleEnableMfa} disabled={loadingQr} className="w-full">
                    {loadingQr ? "Đang tạo..." : "Bật MFA"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <p className="text-sm font-semibold text-green-800">MFA đã được bật</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDisableMfa}
                        className="text-xs"
                      >
                        Tắt MFA
                      </Button>
                    </div>
                  </div>

                  {qrBase64 ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                      <img 
                        src={`data:image/png;base64,${qrBase64}`} 
                        alt="QR MFA" 
                        className="mx-auto h-40 w-40 object-contain" 
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Quét mã QR này bằng ứng dụng Google Authenticator
                      </p>
                      <p className="mt-1 text-xs text-amber-600">
                        💡 Bạn có thể quét mã này trên nhiều thiết bị
                      </p>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleShowQrCode}
                      disabled={loadingQr}
                      className="w-full"
                    >
                      {loadingQr ? "Đang tải..." : "Hiển thị lại QR code"}
                    </Button>
                  )}

                  {/* Form xác minh Google Authenticator - CHỈ chấp nhận mã 6 số, KHÔNG chấp nhận backup code */}
                  <form onSubmit={handleSubmit(onVerifyGoogleAuthenticator)} className="space-y-4">
                    <div>
                      <Label htmlFor="mfaCode">Mã xác thực Google Authenticator</Label>
                      <Input
                        id="mfaCode"
                        type="text"
                        placeholder="123456"
                        className="font-mono text-center text-lg tracking-widest"
                        maxLength={6}
                        {...register("code", {
                          required: "Vui lòng nhập mã xác thực",
                          validate: (value) => {
                            // CHỈ chấp nhận mã 6 số từ Google Authenticator
                            if (!/^\d{6}$/.test(value)) {
                              return "Mã phải là 6 chữ số từ Google Authenticator";
                            }
                            return true;
                          },
                        })}
                        onChange={(e) => {
                          // Chỉ cho phép nhập số, tối đa 6 ký tự
                          let value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                          e.target.value = value;
                          register("code").onChange(e);
                        }}
                      />
                      {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Nhập mã 6 số từ ứng dụng Google Authenticator
                      </p>
                      <p className="mt-1 text-xs text-amber-600">
                        ⚠️ Lưu ý: Backup code chỉ được sử dụng khi đăng nhập, không dùng ở đây
                      </p>
                    </div>
                    <Button type="submit" disabled={verifyingCode} className="w-full">
                      {verifyingCode ? "Đang xác minh..." : "Xác minh"}
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Backup Codes Section */}
          {mfaEnabled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Backup Codes (Recovery Codes)
                </CardTitle>
                <CardDescription>
                  Mã dự phòng để đăng nhập khi không thể truy cập Google Authenticator
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Hiển thị Backup Codes */}
                {showBackupCodes && backupCodes.length > 0 && (
                  <div className="mb-6 rounded-lg border-2 border-amber-400 bg-amber-50 p-4 shadow-lg">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-amber-600" />
                        <h3 className="text-sm font-bold text-amber-900">Backup Codes</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBackupCodes(false)}
                        className="text-xs"
                      >
                        <EyeOff className="h-4 w-4 mr-1" />
                        Ẩn
                      </Button>
                    </div>
                    
                    <div className="mb-3 rounded-lg bg-amber-100 p-3 border border-amber-300">
                      <p className="text-xs font-semibold text-amber-900 mb-1">
                        ⚠️ <strong>QUAN TRỌNG: Lưu các mã này ngay bây giờ!</strong>
                      </p>
                      <p className="text-xs text-amber-800">
                        • Mỗi mã chỉ dùng được <strong>1 lần</strong><br/>
                        • Dùng khi <strong>không thể truy cập Google Authenticator</strong><br/>
                        • Lưu ở nơi an toàn (ghi ra giấy, lưu file, password manager)
                      </p>
                    </div>

                    <div className="mb-3 rounded-lg bg-white p-4 border-2 border-amber-300">
                      <div className="grid grid-cols-2 gap-2">
                        {backupCodes.map((code, index) => (
                          <div
                            key={index}
                            className="rounded border-2 border-amber-400 bg-amber-50 px-3 py-2 text-center font-mono text-sm font-bold text-amber-900 select-all"
                          >
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-amber-800">
                        Còn lại: <span className="text-amber-900 text-base">{remainingBackupCodes}</span> mã
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const content = `BACKUP CODES - CatShop\n\n` +
                            `Lưu các mã này ở nơi an toàn. Mỗi mã chỉ dùng được 1 lần.\n\n` +
                            backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n') +
                            `\n\nNgày tạo: ${new Date().toLocaleString('vi-VN')}\n` +
                            `Email: ${user?.email}`;
                          const blob = new Blob([content], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `catshop-backup-codes-${new Date().getTime()}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Tải xuống
                      </Button>
                    </div>
                  </div>
                )}

                {/* Quản lý Backup Codes */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-slate-600" />
                    <h3 className="text-sm font-semibold text-slate-700">Quản lý Backup Codes</h3>
                  </div>
                  
                  <div className="mb-3 rounded-lg bg-white p-3 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-600">Backup codes còn lại</p>
                        <p className="text-lg font-bold text-slate-900">{remainingBackupCodes} / 10</p>
                      </div>
                      {remainingBackupCodes < 3 && remainingBackupCodes > 0 && (
                        <div className="rounded-lg bg-amber-100 px-2 py-1">
                          <p className="text-xs font-semibold text-amber-800">⚠️ Sắp hết!</p>
                        </div>
                      )}
                      {remainingBackupCodes === 0 && (
                        <div className="rounded-lg bg-red-100 px-2 py-1">
                          <p className="text-xs font-semibold text-red-800">⚠️ Đã hết!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {backupCodes.length > 0 && !showBackupCodes && (
                      <Button
                        variant="outline"
                        onClick={() => setShowBackupCodes(true)}
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Hiển thị Backup Codes
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleRegenerateBackupCodes}
                      disabled={regeneratingCodes}
                      className="w-full"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${regeneratingCodes ? 'animate-spin' : ''}`} />
                      {regeneratingCodes ? "Đang tạo..." : "Tạo lại Backup Codes"}
                    </Button>
                    <p className="text-xs text-slate-500 mt-1">
                      ⚠️ Lưu ý: Tạo lại sẽ vô hiệu hóa tất cả các mã cũ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cảnh báo bảo mật Section */}
          {securityAlerts.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Cảnh báo bảo mật
                </CardTitle>
                <CardDescription>
                  Thông báo về các hoạt động bảo mật gần đây
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-amber-200 bg-amber-50 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-amber-900">
                            {alert.message}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-amber-700">
                            {alert.ip && (
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                <span>{alert.ip}</span>
                              </div>
                            )}
                            {alert.time && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(alert.time)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quản lý thiết bị đã đăng nhập Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Thiết bị đã đăng nhập
                  </CardTitle>
                  <CardDescription>
                    Quản lý các thiết bị đã đăng nhập vào tài khoản của bạn
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadDevices}
                  disabled={loadingDevices}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingDevices ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingDevices ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                  <p className="mt-4 text-sm text-muted-foreground">Đang tải danh sách thiết bị...</p>
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Chưa có thiết bị nào đăng nhập</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {devices.map((device) => {
                    const isCurrentDevice = device.deviceId === currentDeviceId;
                    return (
                      <div
                        key={device.id}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Smartphone className="h-4 w-4 text-slate-600" />
                              <p className="font-semibold text-slate-900">
                                {parseUserAgent(device.userAgent)}
                              </p>
                              {isCurrentDevice && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                  Thiết bị hiện tại
                                </span>
                              )}
                            </div>
                            <div className="space-y-1 text-xs text-slate-600">
                              {device.ipAddress && (
                                <div className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  <span>IP: {device.ipAddress}</span>
                                </div>
                              )}
                              {device.lastLogin && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Đăng nhập lần cuối: {formatTime(device.lastLogin)}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                <span>Trạng thái: {device.trusted ? "Đã tin cậy" : "Chưa tin cậy"}</span>
                              </div>
                            </div>
                          </div>
                          {!isCurrentDevice && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDevice(device.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {devices.length > 1 && (
                    <Button
                      variant="outline"
                      onClick={handleRemoveAllDevices}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa tất cả thiết bị khác
                    </Button>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    💡 Xóa thiết bị sẽ yêu cầu đăng nhập lại trên thiết bị đó
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lịch sử đăng nhập Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Lịch sử đăng nhập
                  </CardTitle>
                  <CardDescription>
                    Xem lịch sử đăng nhập gần đây của bạn
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadDevices();
                    loadSecurityAlerts();
                  }}
                  disabled={loadingDevices}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingDevices ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingDevices ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                  <p className="mt-4 text-sm text-muted-foreground">Đang tải lịch sử...</p>
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Chưa có lịch sử đăng nhập</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {devices.slice(0, 10).map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-100 p-2">
                          <Smartphone className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {parseUserAgent(device.userAgent)}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            {device.ipAddress && (
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {device.ipAddress}
                              </span>
                            )}
                            {device.lastLogin && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(device.lastLogin)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {device.trusted && (
                        <div className="rounded-full bg-green-100 px-2 py-1">
                          <span className="text-xs font-medium text-green-800">Đã tin cậy</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {devices.length > 10 && (
                    <p className="text-xs text-center text-muted-foreground">
                      Hiển thị 10 đăng nhập gần nhất trong tổng số {devices.length} thiết bị
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Security;

