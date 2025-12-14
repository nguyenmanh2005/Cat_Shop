import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Key, Download, RefreshCw, Eye, EyeOff, Lock, Smartphone, Trash2, AlertTriangle, Clock, Globe, Phone, CheckCircle2, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { userService } from "@/services/userService";
import { deviceService } from "@/services/deviceService";
import { authService } from "@/services/authService";
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
  
  // Quản lý thiết bị states
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  
  // Cảnh báo bảo mật states
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);
  
  // Đăng ký số điện thoại states
  const [userProfile, setUserProfile] = useState<{ username?: string; email?: string; phone?: string; address?: string; userId?: number } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpCountdown, setPhoneOtpCountdown] = useState(0);
  const [registeringPhone, setRegisteringPhone] = useState(false);
  const phoneOtpCountdownRef = useRef<NodeJS.Timeout | null>(null);

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
      loadUserProfile();
      
      // Lấy deviceId hiện tại từ localStorage
      const DEVICE_ID_STORAGE_KEY = 'cat_shop_device_id';
      const deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
      setCurrentDeviceId(deviceId);
    }
  }, [isAuthenticated, user, navigate]);

  // Countdown timer cho Phone OTP (2 phút = 120 giây)
  useEffect(() => {
    if (phoneOtpCountdown > 0) {
      phoneOtpCountdownRef.current = setInterval(() => {
        setPhoneOtpCountdown((prev) => {
          if (prev <= 1) {
            if (phoneOtpCountdownRef.current) {
              clearInterval(phoneOtpCountdownRef.current);
              phoneOtpCountdownRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (phoneOtpCountdownRef.current) {
        clearInterval(phoneOtpCountdownRef.current);
        phoneOtpCountdownRef.current = null;
      }
    }

    return () => {
      if (phoneOtpCountdownRef.current) {
        clearInterval(phoneOtpCountdownRef.current);
        phoneOtpCountdownRef.current = null;
      }
    };
  }, [phoneOtpCountdown]);

  // Debug: Log khi userProfile thay đổi
  useEffect(() => {
    console.log("🔄 userProfile state changed:", userProfile);
    console.log("🔄 userProfile?.phone:", userProfile?.phone);
    console.log("🔄 Should show phone:", userProfile && userProfile.phone && userProfile.phone.trim() !== '');
  }, [userProfile]);

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
      console.error("Unable to check MFA status:", err);
      setMfaEnabled(false);
    } finally {
      setCheckingMfa(false);
    }
  };

  // Bật MFA
  const handleEnableMfa = async () => {
    if (!user?.email) {
      setError("Email not found. Please log in again.");
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
        throw new Error("Failed to receive QR code from server");
      }
      
      setQrBase64(data.qrBase64);
      if (data.backupCodes && Array.isArray(data.backupCodes)) {
        setBackupCodes(data.backupCodes);
        setShowBackupCodes(true);
        setRemainingBackupCodes(data.backupCodes.length);
      }
      setMfaEnabled(true);
      toast({
        title: "Success",
        description: "MFA has been enabled. Please scan the QR code and save the backup codes.",
      });
    } catch (err: any) {
      console.error("Error enabling MFA:", err);
      let errorMessage = "Unable to enable MFA. Please try again.";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
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
      setError("Email not found. Please log in again.");
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
        throw new Error("Failed to receive QR code from server");
      }
      
      setQrBase64(data.qrBase64);
      toast({
        title: "Success",
        description: "QR code has been displayed. You can scan it again with the Google Authenticator app.",
      });
    } catch (err: any) {
      console.error("Error getting QR code:", err);
      let errorMessage = "Unable to get QR code. Please try again.";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingQr(false);
    }
  };

  // Đổi mật khẩu đã được đưa về flow "Quên mật khẩu" ở màn đăng nhập

  // Load danh sách thiết bị
  const loadDevices = async () => {
    if (!user?.email) return;
    try {
      setLoadingDevices(true);
      const data = await deviceService.getUserDevices(user.email);
      setDevices(data || []);
    } catch (err) {
      console.error("Unable to load device list:", err);
      setDevices([]);
      toast({
        title: "Error",
        description: "Unable to load device list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingDevices(false);
    }
  };

  // Xóa một thiết bị
  const handleRemoveDevice = async (deviceId: number) => {
    if (!user?.email) return;
    
    if (!window.confirm("Are you sure you want to remove this device? You will need to log in again on this device.")) {
      return;
    }

    try {
      await deviceService.removeDevice(deviceId, user.email);
      toast({
        title: "Success",
        description: "Device has been removed",
      });
      await loadDevices();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Unable to remove device";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Xóa tất cả thiết bị (trừ thiết bị hiện tại)
  const handleRemoveAllDevices = async () => {
    if (!user?.email) return;
    
    if (!window.confirm("Are you sure you want to remove all devices? You will need to log in again on all devices (except the current device).")) {
      return;
    }

    try {
      await deviceService.removeAllDevices(user.email);
      toast({
        title: "Success",
        description: "All devices have been removed",
      });
      await loadDevices();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Unable to remove device";
      toast({
        title: "Error",
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
              message: `Login from new device: ${device.userAgent || 'Unknown device'}`,
              time: device.lastLogin,
              ip: device.ipAddress,
            });
          }
        }
      });
      
      setSecurityAlerts(alerts);
    } catch (err) {
      console.error("Unable to load security alerts:", err);
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

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US");
  };

  // Parse user agent để lấy tên thiết bị
  const parseUserAgent = (userAgent?: string | null) => {
    if (!userAgent) return "Unknown device";
    
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac")) return "Mac";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "iOS";
    
    return userAgent.substring(0, 50) + (userAgent.length > 50 ? "..." : "");
  };

  // Load user profile để lấy số điện thoại
  const loadUserProfile = async () => {
    if (!user?.email) return;
    try {
      setLoadingProfile(true);
      const profile = await authService.getProfile(user.email);
      console.log("📱 User profile loaded:", profile);
      console.log("📱 Profile phone field:", profile?.phone);
      console.log("📱 Phone type:", typeof profile?.phone);
      console.log("📱 Phone trimmed:", profile?.phone?.trim());
      
      // Set userProfile state
      setUserProfile(profile);
      
      // Kiểm tra phone - có thể là null, undefined, hoặc empty string
      if (profile && profile.phone && profile.phone.trim() !== '') {
        setPhoneNumber(profile.phone);
        console.log("✅ Phone number found and set:", profile.phone);
      } else {
        console.log("⚠️ No phone number found in profile");
        setPhoneNumber("");
      }
    } catch (err: any) {
      console.error("Unable to load user information:", err);
      // If 401 error, may be due to not logged in or token expired
      if (err?.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Your login session has expired. Please log in again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  // Debug: Log khi userProfile thay đổi
  useEffect(() => {
    console.log("🔄 userProfile state changed:", userProfile);
    console.log("🔄 userProfile.phone:", userProfile?.phone);
    console.log("🔄 Should show phone:", userProfile && userProfile.phone && userProfile.phone.trim() !== '');
  }, [userProfile]);

  // Gửi OTP để xác minh số điện thoại
  const handleSendPhoneOtp = async () => {
    // Validate phone number format (Vietnamese format: 10 digits starting with 0, or +84)
    const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number format (e.g., 0912345678 or +84912345678)",
        variant: "destructive",
      });
      return;
    }

    try {
      setRegisteringPhone(true);
      console.log("📱 [Security] Sending SMS OTP to:", cleanPhone);
      const result = await authService.sendSmsOtp(cleanPhone);
      console.log("✅ [Security] SMS OTP sent successfully:", result);
      setPhoneOtpSent(true);
      setPhoneOtpCountdown(120); // Bắt đầu countdown 2 phút (120 giây)
      
      // Hiển thị OTP trong toast nếu có (DEV MODE)
      // Response từ backend là string message có dạng: "Mã OTP đã được gửi đến số điện thoại của bạn. (DEV MODE - OTP: 123456 - Vui lòng kiểm tra console backend để lấy mã)"
      const otpMessage = result || "";
      const otpMatch = otpMessage.match(/OTP:\s*(\d{6})/);
      const otp = otpMatch ? otpMatch[1] : null;
      
      toast({
        title: "OTP Sent",
        description: otp 
          ? `OTP code has been sent to ${cleanPhone}.\n\n🔑 OTP Code: ${otp}\n\n⚠️ DEV MODE - Code is valid for 2 minutes`
          : `OTP code has been sent to ${cleanPhone}. Code is valid for 2 minutes. Please check backend console to get OTP code (DEV MODE).`,
        duration: 15000, // Display longer so user can see OTP
      });
    } catch (error: any) {
      console.error("❌ [Security] Error sending SMS OTP:", error);
      toast({
        title: "Error Sending OTP",
        description: error.message || "Unable to send OTP code via SMS",
        variant: "destructive",
      });
    } finally {
      setRegisteringPhone(false);
    }
  };

  // Xác minh OTP và lưu số điện thoại
  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtp || phoneOtp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP code",
        variant: "destructive",
      });
      return;
    }

    if (!user?.email || !userProfile) {
      toast({
        title: "Error",
        description: "User information not found",
        variant: "destructive",
      });
      return;
    }

    const cleanPhone = phoneNumber.replace(/\s+/g, '');

    try {
      setRegisteringPhone(true);
      
      // Verify OTP cho đăng ký số điện thoại
      // Backend cần có API: POST /auth/verify-sms-otp-register { phoneNumber, otp }
      try {
        await authService.verifySmsOtpForRegistration(cleanPhone, phoneOtp);
      } catch (verifyError: any) {
        // Nếu verify thất bại, throw error để hiển thị thông báo
        throw verifyError;
      }
      
      // Update phone number sau khi verify thành công
      await userService.updateUser(userProfile.userId, {
        phone: cleanPhone
      });
      
      // Reload profile
      await loadUserProfile();
      
      // Reset form
      setPhoneOtp("");
      setPhoneOtpSent(false);
      setPhoneOtpCountdown(0);
      
      toast({
        title: "Success",
        description: "Phone number has been registered and verified successfully!",
      });
    } catch (error: any) {
      // Nếu update phone number thất bại, có thể do OTP chưa được verify
      // Hoặc có lỗi khác
      const errorMessage = error?.response?.data?.message || error?.message || "OTP code is incorrect or has expired";
      toast({
        title: "Verification Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setRegisteringPhone(false);
    }
  };

  // Gửi lại OTP
  const handleResendPhoneOtp = async () => {
    setPhoneOtpCountdown(0);
    if (phoneOtpCountdownRef.current) {
      clearInterval(phoneOtpCountdownRef.current);
      phoneOtpCountdownRef.current = null;
    }
    setPhoneOtp("");
    await handleSendPhoneOtp();
  };

  // Tắt MFA
  const handleDisableMfa = async () => {
    if (!user?.email) {
      setError("Email not found. Please log in again.");
      return;
    }

    // Xác nhận trước khi tắt
    const confirmed = window.confirm(
      "Are you sure you want to disable Google Authenticator (MFA)?\n\n" +
      "⚠️ Warning:\n" +
      "• All backup codes will be deleted\n" +
      "• Your account will be less secure\n" +
      "• You will need to enable MFA again and scan a new QR code if you want to use it again"
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
        title: "Success",
        description: "MFA has been disabled. Your account no longer requires two-factor authentication.",
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Unable to disable MFA. Please try again.");
    }
  };

  // Tạo lại backup codes
  const handleRegenerateBackupCodes = async () => {
    if (!user?.email) {
      setError("Email not found. Please log in again.");
      return;
    }
    if (!window.confirm("Are you sure you want to regenerate backup codes? Old codes will be invalidated.")) {
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
        title: "Success",
        description: "Backup codes have been regenerated. Please save the new codes.",
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Unable to regenerate backup codes. Please try again.");
    } finally {
      setRegeneratingCodes(false);
    }
  };

  // Xác minh Google Authenticator (chỉ chấp nhận mã 6 số, KHÔNG chấp nhận backup code)
  const onVerifyGoogleAuthenticator = async ({ code }: GoogleAuthenticatorFormValues) => {
    if (!user?.email) {
      setError("Email not found. Please log in again.");
      return;
    }

    // Chỉ chấp nhận mã 6 số từ Google Authenticator
    if (!code || !/^\d{6}$/.test(code)) {
      setError("Code must be 6 digits from Google Authenticator");
      return;
    }

    try {
      setError(undefined);
      setVerifyingCode(true);
      
      // Lấy deviceId từ localStorage hoặc tạo mới
      const DEVICE_ID_STORAGE_KEY = 'cat_shop_device_id';
      let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
      if (!deviceId || deviceId.trim() === '') {
        deviceId = crypto.randomUUID();
        localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
      }
      
      console.log("🔄 [MFA Verify] Sending request:", {
        email: user.email,
        code: code,
        deviceId: deviceId
      });
      
      const response = await apiService.post("/auth/mfa/verify", {
        email: user.email.trim(),
        code: code.trim(),
        deviceId: deviceId.trim(),
      });
      
      console.log("✅ [MFA Verify] Success:", response);
      
      reset();
      toast({
        title: "Success",
        description: "Google Authenticator verification successful!",
      });
      await checkMfaStatus();
    } catch (err: any) {
      console.error("❌ [MFA Verify] Error:", err);
      console.error("❌ [MFA Verify] Error response:", err?.response?.data);
      
      let errorMessage = "Invalid authentication code. Please check the code again. Google Authenticator or backup code.";
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
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
              Account Security
            </h1>
            <p className="text-muted-foreground">
              Manage two-factor authentication (MFA) and backup codes
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Đăng ký số điện thoại Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Phone Number Registration
              </CardTitle>
              <CardDescription>
                Register your phone number to use SMS OTP verification when logging in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                // Debug logging
                console.log("🔄 Render - loadingProfile:", loadingProfile);
                console.log("🔄 Render - userProfile:", userProfile);
                console.log("🔄 Render - userProfile?.phone:", userProfile?.phone);
                console.log("🔄 Render - phone check:", userProfile && userProfile.phone && userProfile.phone.trim() !== '');
                return null;
              })()}
              {loadingProfile ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                  <p className="mt-4 text-sm text-muted-foreground">Loading information...</p>
                </div>
              ) : userProfile && userProfile.phone && userProfile.phone.trim() !== '' ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-blue-800">Phone number registered</p>
                        <p className="text-sm text-blue-700 mt-1">Phone number: <strong>{userProfile.phone}</strong></p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can use this phone number to verify with SMS OTP when logging in.
                  </p>
                </div>
              ) : !phoneOtpSent ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                      You have not registered a phone number. Please enter your phone number and verify with OTP code.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="Enter phone number (e.g., 0912345678)"
                        value={phoneNumber}
                        onChange={(e) => {
                          // Chỉ cho phép số và dấu +
                          const value = e.target.value.replace(/[^0-9+]/g, '');
                          setPhoneNumber(value);
                        }}
                        className="pl-10"
                        disabled={registeringPhone}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Format: 0912345678 or +84912345678
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleSendPhoneOtp} 
                    className="w-full" 
                    disabled={registeringPhone || !phoneNumber}
                  >
                    {registeringPhone ? "Sending..." : "Send OTP Verification Code"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="phoneOtp">OTP Verification Code</Label>
                      {phoneOtpCountdown > 0 && (
                        <span className="text-sm text-muted-foreground">
                          Time remaining: <span className="font-semibold text-primary">{Math.floor(phoneOtpCountdown / 60)}:{(phoneOtpCountdown % 60).toString().padStart(2, '0')}</span>
                        </span>
                      )}
                      {phoneOtpCountdown === 0 && phoneOtpSent && (
                        <span className="text-sm text-red-500 font-medium">
                          OTP code has expired
                        </span>
                      )}
                    </div>
                    <Input
                      id="phoneOtp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      maxLength={6}
                      className={`text-center text-2xl tracking-[0.6rem] ${phoneOtpCountdown === 0 ? 'border-red-300' : ''}`}
                      disabled={registeringPhone}
                    />
                      <p className="text-xs text-muted-foreground text-center">
                      OTP code has been sent to: <strong>{phoneNumber}</strong>
                    </p>
                    {phoneOtpCountdown === 0 && phoneOtpSent && (
                      <p className="text-xs text-red-500 text-center">
                        ⚠️ OTP code has expired. Please request a new code.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleVerifyPhoneOtp} 
                      className="flex-1" 
                      disabled={registeringPhone || phoneOtp.length !== 6}
                    >
                      {registeringPhone ? "Verifying..." : "Verify and Register"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleResendPhoneOtp} 
                      disabled={registeringPhone}
                    >
                      {phoneOtpCountdown > 0 ? `Resend (${Math.floor(phoneOtpCountdown / 60)}:${(phoneOtpCountdown % 60).toString().padStart(2, '0')})` : "Resend Code"}
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPhoneOtpSent(false);
                      setPhoneOtp("");
                      setPhoneOtpCountdown(0);
                    }}
                    className="w-full"
                    disabled={registeringPhone}
                  >
                    Back
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Đăng nhập thiết bị khác bằng QR (thay cho Đổi mật khẩu thủ công) */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Login to Other Device with QR Code
              </CardTitle>
              <CardDescription>
                Open this security page on your logged-in phone, then scan the QR code on your computer screen to log in quickly, similar to Zalo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                  <p className="font-medium mb-2">How to use:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open the login page on your computer and select login with QR code.</li>
                    <li>Open this security page on your phone (already logged in).</li>
                    <li>Click the button below to go to the QR scanner page and scan the code on your computer screen.</li>
                    <li>After scanning, your computer will automatically log in to your account.</li>
                  </ol>
                </div>
                <Button
                  type="button"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => {
                    navigate("/qr-login");
                  }}
                >
                  <QrCode className="h-4 w-4" />
                  <span>Open camera to scan login QR code</span>
                </Button>
              </div>
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
                Enable two-factor authentication to protect your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkingMfa ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                  <p className="mt-4 text-sm text-muted-foreground">Checking MFA status...</p>
                </div>
              ) : mfaEnabled === false ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                      MFA is not enabled. Click the button below to enable and scan the QR code with the Google Authenticator app.
                    </p>
                  </div>
                  <Button onClick={handleEnableMfa} disabled={loadingQr} className="w-full">
                    {loadingQr ? "Creating..." : "Enable MFA"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <p className="text-sm font-semibold text-blue-800">MFA is enabled</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDisableMfa}
                        className="text-xs"
                      >
                        Disable MFA
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
                        Scan this QR code with the Google Authenticator app
                      </p>
                      <p className="mt-1 text-xs text-amber-600">
                        💡 You can scan this code on multiple devices
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
                      {loadingQr ? "Loading..." : "Show QR Code Again"}
                    </Button>
                  )}

                  {/* Form xác minh Google Authenticator - CHỈ chấp nhận mã 6 số, KHÔNG chấp nhận backup code */}
                  <form onSubmit={handleSubmit(onVerifyGoogleAuthenticator)} className="space-y-4">
                    <div>
                      <Label htmlFor="mfaCode">Google Authenticator Code</Label>
                      <Input
                        id="mfaCode"
                        type="text"
                        placeholder="123456"
                        className="font-mono text-center text-lg tracking-widest"
                        maxLength={6}
                        {...register("code", {
                          required: "Please enter verification code",
                          validate: (value) => {
                            // ONLY accept 6-digit code from Google Authenticator
                            if (!/^\d{6}$/.test(value)) {
                              return "Code must be 6 digits from Google Authenticator";
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
                        Enter 6-digit code from Google Authenticator app
                      </p>
                      <p className="mt-1 text-xs text-amber-600">
                        ⚠️ Note: Backup codes are only used when logging in, not here
                      </p>
                    </div>
                    <Button type="submit" disabled={verifyingCode} className="w-full">
                      {verifyingCode ? "Verifying..." : "Verify"}
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
                  Backup codes to log in when you cannot access Google Authenticator
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
                        Hide
                      </Button>
                    </div>
                    
                    <div className="mb-3 rounded-lg bg-amber-100 p-3 border border-amber-300">
                      <p className="text-xs font-semibold text-amber-900 mb-1">
                        ⚠️ <strong>IMPORTANT: Save these codes now!</strong>
                      </p>
                      <p className="text-xs text-amber-800">
                        • Each code can only be used <strong>once</strong><br/>
                        • Use when <strong>you cannot access Google Authenticator</strong><br/>
                        • Save in a safe place (write down, save file, password manager)
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
                        Remaining: <span className="text-amber-900 text-base">{remainingBackupCodes}</span> codes
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const content = `BACKUP CODES - CatShop\n\n` +
                            `Save these codes in a safe place. Each code can only be used once.\n\n` +
                            backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n') +
                            `\n\nCreated: ${new Date().toLocaleString('en-US')}\n` +
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
                        Download
                      </Button>
                    </div>
                  </div>
                )}

                {/* Quản lý Backup Codes */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-slate-600" />
                    <h3 className="text-sm font-semibold text-slate-700">Manage Backup Codes</h3>
                  </div>
                  
                  <div className="mb-3 rounded-lg bg-white p-3 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-600">Remaining backup codes</p>
                        <p className="text-lg font-bold text-slate-900">{remainingBackupCodes} / 10</p>
                      </div>
                      {remainingBackupCodes < 3 && remainingBackupCodes > 0 && (
                        <div className="rounded-lg bg-amber-100 px-2 py-1">
                          <p className="text-xs font-semibold text-amber-800">⚠️ Running low!</p>
                        </div>
                      )}
                      {remainingBackupCodes === 0 && (
                        <div className="rounded-lg bg-red-100 px-2 py-1">
                          <p className="text-xs font-semibold text-red-800">⚠️ Out of codes!</p>
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
                        Show Backup Codes
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleRegenerateBackupCodes}
                      disabled={regeneratingCodes}
                      className="w-full"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${regeneratingCodes ? 'animate-spin' : ''}`} />
                      {regeneratingCodes ? "Generating..." : "Regenerate Backup Codes"}
                    </Button>
                    <p className="text-xs text-slate-500 mt-1">
                      ⚠️ Note: Regenerating will invalidate all old codes
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
                  Security Alerts
                </CardTitle>
                <CardDescription>
                  Notifications about recent security activities
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
                    Logged-in Devices
                  </CardTitle>
                  <CardDescription>
                    Manage devices that have logged into your account
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
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingDevices ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                  <p className="mt-4 text-sm text-muted-foreground">Loading device list...</p>
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No devices logged in</p>
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
                                  Current device
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
                                  <span>Last login: {formatTime(device.lastLogin)}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                <span>Status: {device.trusted ? "Trusted" : "Not trusted"}</span>
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
                      Remove All Other Devices
                    </Button>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    💡 Removing a device will require logging in again on that device
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
                    Login History
                  </CardTitle>
                  <CardDescription>
                    View your recent login history
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
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingDevices ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                  <p className="mt-4 text-sm text-muted-foreground">Loading history...</p>
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No login history</p>
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
                        <div className="rounded-full bg-blue-100 px-2 py-1">
                          <span className="text-xs font-medium text-blue-800">Trusted</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {devices.length > 10 && (
                    <p className="text-xs text-center text-muted-foreground">
                      Showing 10 most recent logins out of {devices.length} devices
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

