import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Shield, Key, Download, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";

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
      
      // Gọi API với query string theo word.txt: POST /auth/mfa/enable?email=<email>
      const data = await apiService.post<{
        qrBase64: string;
        backupCodes?: string[];
        backupCodesCount?: number;
        secret?: string;
      }>(`/auth/mfa/enable?email=${encodeURIComponent(user.email)}`, null);
      
      console.log('✅ MFA Enable Response:', data);
      
      // Kiểm tra và xử lý QR code
      if (data.qrBase64) {
        // Đảm bảo QR code có prefix data:image nếu chưa có
        let qrCodeUrl = data.qrBase64;
        if (!qrCodeUrl.startsWith('data:image')) {
          qrCodeUrl = `data:image/png;base64,${qrCodeUrl}`;
        }
        setQrBase64(qrCodeUrl);
        console.log('✅ QR Code đã được set:', qrCodeUrl.substring(0, 50) + '...');
      } else {
        console.warn('⚠️ Không có QR code trong response');
        setError("Không nhận được QR code từ server. Vui lòng thử lại.");
      }
      
      // Xử lý backup codes
      if (data.backupCodes && Array.isArray(data.backupCodes)) {
        setBackupCodes(data.backupCodes);
        setShowBackupCodes(true);
        setRemainingBackupCodes(data.backupCodes.length);
        console.log('✅ Backup codes đã được set:', data.backupCodes.length);
      }
      
      setMfaEnabled(true);
      toast({
        title: "Thành công",
        description: "MFA đã được bật. Vui lòng quét QR code và lưu backup codes.",
      });
    } catch (err: any) {
      console.error('❌ Error enabling MFA:', err);
      const errorMessage = err?.response?.data?.message || err?.message || "Không thể bật MFA. Vui lòng thử lại.";
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

  // Xác minh Google Authenticator
  const onVerifyGoogleAuthenticator = async ({ code }: GoogleAuthenticatorFormValues) => {
    if (!user?.email) {
      setError("Không tìm thấy email. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      setError(undefined);
      setVerifyingCode(true);
      
      // Validate và format code theo word.txt
      // - Google Authenticator: 6 số → convert sang number
      // - Backup Code: XXXX-XXXX → giữ nguyên string
      const isGoogleAuthCode = /^\d{6}$/.test(code);
      const isBackupCode = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(code);
      
      if (!isGoogleAuthCode && !isBackupCode) {
        setError("Mã phải là 6 số (Google Authenticator) hoặc XXXX-XXXX (Backup Code)");
        return;
      }
      
      // Format code: số → number, backup code → string uppercase
      const formattedCode = isGoogleAuthCode 
        ? parseInt(code, 10)  // Convert 6-digit code to number
        : code.toUpperCase().replace(/\s/g, ''); // Backup code: uppercase, remove spaces
      
      console.log('🔐 Verifying MFA:', {
        email: user.email,
        code: formattedCode,
        codeType: isGoogleAuthCode ? 'GoogleAuth' : 'BackupCode',
      });
      
      const response = await apiService.post("/auth/mfa/verify", {
        email: user.email,
        code: formattedCode,
      });
      
      console.log('✅ MFA Verify Response:', response);
      
      reset();
      setQrBase64(null); // Clear QR code after successful verification
      toast({
        title: "Thành công",
        description: "Xác minh Google Authenticator thành công!",
      });
      await checkMfaStatus();
    } catch (err: any) {
      console.error('❌ Verify Google Authenticator error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || "Mã Google Authenticator không chính xác, vui lòng thử lại.";
      setError(errorMessage);
      toast({
        title: "Lỗi xác thực",
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

          {/* Google Authenticator Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Google Authenticator (MFA)
                  </CardTitle>
                  <CardDescription>
                    Bật xác thực đa yếu tố để bảo vệ tài khoản của bạn
                  </CardDescription>
                </div>
                {!checkingMfa && mfaEnabled !== null && (
                  <div className="flex items-center gap-3">
                    <Label htmlFor="mfa-toggle" className="text-sm font-medium cursor-pointer">
                      {mfaEnabled ? "Đã bật" : "Đã tắt"}
                    </Label>
                    <Switch
                      id="mfa-toggle"
                      checked={mfaEnabled}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleEnableMfa();
                        } else {
                          handleDisableMfa();
                        }
                      }}
                      disabled={loadingQr || checkingMfa}
                    />
                  </div>
                )}
              </div>
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
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <p className="text-sm font-semibold text-green-800">MFA đã được bật</p>
                    </div>
                    <p className="text-xs text-green-700 mt-2">
                      Tài khoản của bạn đang được bảo vệ bằng xác thực đa yếu tố. Bạn có thể tắt MFA bằng cách sử dụng Switch ở trên.
                    </p>
                  </div>

                  {qrBase64 ? (
                    <div className="space-y-4">
                      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6 text-center">
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-blue-900 mb-2">
                            Bước 1: Quét mã QR
                          </h3>
                          <p className="text-xs text-blue-700 mb-4">
                            Mở ứng dụng Google Authenticator trên điện thoại và quét mã QR bên dưới
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 inline-block">
                          <img 
                            src={qrBase64} 
                            alt="QR Code MFA" 
                            className="mx-auto h-48 w-48 object-contain"
                            onError={(e) => {
                              console.error('❌ QR Code image load error:', e);
                              setError("Không thể hiển thị QR code. Vui lòng thử lại.");
                            }}
                          />
                        </div>
                        <p className="mt-4 text-xs text-blue-700">
                          💡 <strong>Chưa có ứng dụng?</strong> Tải Google Authenticator từ App Store hoặc Google Play
                        </p>
                      </div>
                      
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <p className="text-xs text-amber-800">
                          <strong>⚠️ Lưu ý:</strong> Sau khi quét QR code, bạn sẽ thấy mã 6 số trong ứng dụng Google Authenticator. 
                          Nhập mã đó vào ô "Mã xác thực" bên dưới để hoàn tất việc bật MFA.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        QR code sẽ được hiển thị sau khi bật MFA
                      </p>
                    </div>
                  )}

                  {/* Form xác minh Google Authenticator */}
                  <form onSubmit={handleSubmit(onVerifyGoogleAuthenticator)} className="space-y-4">
                    <div>
                      <Label htmlFor="mfaCode">Mã xác thực</Label>
                      <Input
                        id="mfaCode"
                        type="text"
                        placeholder="123456 hoặc XXXX-XXXX"
                        className="font-mono text-center text-lg tracking-widest"
                        {...register("code", {
                          required: "Vui lòng nhập mã xác thực",
                          validate: (value) => {
                            const isGoogleAuth = /^\d{6}$/.test(value);
                            const isBackupCode = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(value.toUpperCase());
                            if (!isGoogleAuth && !isBackupCode) {
                              return "Mã phải là 6 số (Google Authenticator) hoặc XXXX-XXXX (Backup Code)";
                            }
                            return true;
                          },
                        })}
                        onChange={(e) => {
                          let value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                          if (value.length > 4 && !value.includes('-')) {
                            value = value.slice(0, 4) + '-' + value.slice(4, 8);
                          }
                          e.target.value = value;
                          register("code").onChange(e);
                        }}
                      />
                      {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Nhập mã 6 số từ Google Authenticator hoặc Backup Code (XXXX-XXXX)
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Security;

