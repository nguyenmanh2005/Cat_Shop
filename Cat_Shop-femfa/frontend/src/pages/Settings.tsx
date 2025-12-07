import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Palette, 
  Globe, 
  Shield, 
  Mail,
  Smartphone,
  Moon,
  Sun,
  Monitor,
  Save,
  Trash2,
  Download,
  Upload
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  // Appearance settings
  const [compactMode, setCompactMode] = useState(false);

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState<"public" | "private" | "friends">("private");
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  // Account settings
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    // Load saved settings from localStorage
    loadSettings();
  }, [isAuthenticated, navigate]);

  const loadSettings = () => {
    // Load notification settings
    const savedEmailNotif = localStorage.getItem("settings_email_notifications");
    if (savedEmailNotif !== null) {
      setEmailNotifications(savedEmailNotif === "true");
    }

    const savedPushNotif = localStorage.getItem("settings_push_notifications");
    if (savedPushNotif !== null) {
      setPushNotifications(savedPushNotif === "true");
    }

    const savedOrderUpdates = localStorage.getItem("settings_order_updates");
    if (savedOrderUpdates !== null) {
      setOrderUpdates(savedOrderUpdates === "true");
    }

    const savedPromoEmails = localStorage.getItem("settings_promotional_emails");
    if (savedPromoEmails !== null) {
      setPromotionalEmails(savedPromoEmails === "true");
    }

    const savedSecurityAlerts = localStorage.getItem("settings_security_alerts");
    if (savedSecurityAlerts !== null) {
      setSecurityAlerts(savedSecurityAlerts === "true");
    }

    // Theme và language được quản lý bởi ThemeProvider và LanguageProvider
    // Không cần load từ localStorage ở đây

    const savedCompactMode = localStorage.getItem("settings_compact_mode");
    if (savedCompactMode !== null) {
      setCompactMode(savedCompactMode === "true");
    }

    // Load privacy settings
    const savedProfileVisibility = localStorage.getItem("settings_profile_visibility");
    if (savedProfileVisibility) {
      setProfileVisibility(savedProfileVisibility as "public" | "private" | "friends");
    }

    const savedShowEmail = localStorage.getItem("settings_show_email");
    if (savedShowEmail !== null) {
      setShowEmail(savedShowEmail === "true");
    }

    const savedShowPhone = localStorage.getItem("settings_show_phone");
    if (savedShowPhone !== null) {
      setShowPhone(savedShowPhone === "true");
    }

    const savedDataSharing = localStorage.getItem("settings_data_sharing");
    if (savedDataSharing !== null) {
      setDataSharing(savedDataSharing === "true");
    }

    const savedAnalytics = localStorage.getItem("settings_analytics");
    if (savedAnalytics !== null) {
      setAnalytics(savedAnalytics === "true");
    }
  };

  const saveSettings = () => {
    // Save notification settings
    localStorage.setItem("settings_email_notifications", emailNotifications.toString());
    localStorage.setItem("settings_push_notifications", pushNotifications.toString());
    localStorage.setItem("settings_order_updates", orderUpdates.toString());
    localStorage.setItem("settings_promotional_emails", promotionalEmails.toString());
    localStorage.setItem("settings_security_alerts", securityAlerts.toString());

    // Theme và language được tự động lưu bởi ThemeProvider và LanguageProvider
    // Chỉ cần lưu compact mode
    localStorage.setItem("settings_compact_mode", compactMode.toString());

    // Save privacy settings
    localStorage.setItem("settings_profile_visibility", profileVisibility);
    localStorage.setItem("settings_show_email", showEmail.toString());
    localStorage.setItem("settings_show_phone", showPhone.toString());
    localStorage.setItem("settings_data_sharing", dataSharing.toString());
    localStorage.setItem("settings_analytics", analytics.toString());

    toast({
      title: "Đã lưu cài đặt",
      description: "Tất cả các thay đổi đã được lưu thành công.",
    });
  };

  const exportData = () => {
    const settings = {
      notifications: {
        email: emailNotifications,
        push: pushNotifications,
        orderUpdates,
        promotionalEmails,
        securityAlerts,
      },
      appearance: {
        theme,
        language,
        compactMode,
      },
      privacy: {
        profileVisibility,
        showEmail,
        showPhone,
        dataSharing,
        analytics,
      },
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `settings-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Đã xuất dữ liệu",
      description: "Cài đặt của bạn đã được tải xuống.",
    });
  };

  const handleDeleteAccount = () => {
    if (!deleteAccountConfirm) {
      toast({
        title: "Xác nhận xóa tài khoản",
        description: "Vui lòng đánh dấu vào ô xác nhận để tiếp tục.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Tính năng đang phát triển",
      description: "Tính năng xóa tài khoản sẽ sớm được triển khai.",
      variant: "destructive",
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden page-transition">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <SettingsIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Cài đặt
              </h1>
            </div>
            <p className="text-muted-foreground">
              Quản lý cài đặt tài khoản và tùy chọn của bạn
            </p>
          </div>

          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Thông báo</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Giao diện</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Quyền riêng tư</span>
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Quản trị</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="account" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Tài khoản</span>
              </TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Thông báo Email
                  </CardTitle>
                  <CardDescription>
                    Quản lý các thông báo được gửi qua email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Thông báo qua Email
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo quan trọng qua email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="order-updates">Cập nhật đơn hàng</Label>
                      <p className="text-sm text-muted-foreground">
                        Thông báo về trạng thái đơn hàng của bạn
                      </p>
                    </div>
                    <Switch
                      id="order-updates"
                      checked={orderUpdates}
                      onCheckedChange={setOrderUpdates}
                      disabled={!emailNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="promotional-emails">Email khuyến mãi</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông tin về ưu đãi và sản phẩm mới
                      </p>
                    </div>
                    <Switch
                      id="promotional-emails"
                      checked={promotionalEmails}
                      onCheckedChange={setPromotionalEmails}
                      disabled={!emailNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="security-alerts" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Cảnh báo bảo mật
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Thông báo về các hoạt động bảo mật quan trọng
                      </p>
                    </div>
                    <Switch
                      id="security-alerts"
                      checked={securityAlerts}
                      onCheckedChange={setSecurityAlerts}
                      disabled={!emailNotifications}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Thông báo Push
                  </CardTitle>
                  <CardDescription>
                    Nhận thông báo trực tiếp trên thiết bị của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Bật thông báo Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Cho phép gửi thông báo đến trình duyệt của bạn
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Giao diện
                  </CardTitle>
                  <CardDescription>
                    Tùy chỉnh giao diện và trải nghiệm của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Chủ đề</Label>
                    <Select 
                      value={theme || "system"} 
                      onValueChange={(value) => {
                        setTheme(value as "light" | "dark" | "system");
                        toast({
                          title: "Đã thay đổi chủ đề",
                          description: `Chủ đề đã được chuyển sang ${value === "light" ? "Sáng" : value === "dark" ? "Tối" : "Theo hệ thống"}`,
                        });
                      }}
                    >
                      <SelectTrigger id="theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Sáng
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Tối
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            Theo hệ thống
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Chủ đề hiện tại: {resolvedTheme === "dark" ? "Tối" : "Sáng"} {theme === "system" && "(Theo hệ thống)"}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="language" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Ngôn ngữ
                    </Label>
                    <Select 
                      value={language} 
                      onValueChange={(value) => {
                        setLanguage(value as "vi" | "en" | "zh" | "ja");
                        toast({
                          title: "Đã thay đổi ngôn ngữ",
                          description: `Ngôn ngữ đã được chuyển sang ${value === "vi" ? "Tiếng Việt" : value === "en" ? "English" : value === "zh" ? "中文" : "日本語"}`,
                        });
                      }}
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Ngôn ngữ hiện tại: {language === "vi" ? "Tiếng Việt" : language === "en" ? "English" : language === "zh" ? "中文" : "日本語"}
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-mode">Chế độ compact</Label>
                      <p className="text-sm text-muted-foreground">
                        Hiển thị nhiều nội dung hơn trên màn hình
                      </p>
                    </div>
                    <Switch
                      id="compact-mode"
                      checked={compactMode}
                      onCheckedChange={setCompactMode}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Quyền riêng tư
                  </CardTitle>
                  <CardDescription>
                    Kiểm soát thông tin cá nhân của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="profile-visibility">Hiển thị hồ sơ</Label>
                    <Select value={profileVisibility} onValueChange={(value) => setProfileVisibility(value as "public" | "private" | "friends")}>
                      <SelectTrigger id="profile-visibility">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <span>Công khai</span>
                            <Badge variant="outline">Mọi người</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="friends">
                          <div className="flex items-center gap-2">
                            <span>Bạn bè</span>
                            <Badge variant="outline">Chỉ bạn bè</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <span>Riêng tư</span>
                            <Badge variant="outline">Chỉ mình tôi</Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Ai có thể xem hồ sơ của bạn
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-email">Hiển thị Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Cho phép người khác xem email của bạn
                      </p>
                    </div>
                    <Switch
                      id="show-email"
                      checked={showEmail}
                      onCheckedChange={setShowEmail}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-phone">Hiển thị Số điện thoại</Label>
                      <p className="text-sm text-muted-foreground">
                        Cho phép người khác xem số điện thoại của bạn
                      </p>
                    </div>
                    <Switch
                      id="show-phone"
                      checked={showPhone}
                      onCheckedChange={setShowPhone}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-sharing">Chia sẻ dữ liệu</Label>
                      <p className="text-sm text-muted-foreground">
                        Cho phép chia sẻ dữ liệu ẩn danh để cải thiện dịch vụ
                      </p>
                    </div>
                    <Switch
                      id="data-sharing"
                      checked={dataSharing}
                      onCheckedChange={setDataSharing}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="analytics">Phân tích sử dụng</Label>
                      <p className="text-sm text-muted-foreground">
                        Thu thập dữ liệu để phân tích và cải thiện trải nghiệm
                      </p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={analytics}
                      onCheckedChange={setAnalytics}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Admin Tab - Chỉ hiển thị cho Admin */}
            {isAdmin && (
              <TabsContent value="admin" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <SettingsIcon className="h-5 w-5" />
                      Cài đặt Quản trị
                    </CardTitle>
                    <CardDescription>
                      Quản lý cài đặt hệ thống và quyền truy cập
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Vai trò</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-primary">
                          {user?.role === "admin" ? "Quản trị viên" : "Người dùng"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {user?.email}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Quản lý hệ thống</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          onClick={() => navigate("/admin")}
                          className="flex items-center gap-2"
                        >
                          <SettingsIcon className="h-4 w-4" />
                          Bảng điều khiển
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate("/admin/categories")}
                          className="flex items-center gap-2"
                        >
                          <SettingsIcon className="h-4 w-4" />
                          Quản lý danh mục
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Báo cáo và Thống kê</Label>
                      <p className="text-sm text-muted-foreground">
                        Xem báo cáo và thống kê hệ thống
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/admin")}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Xem báo cáo
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Bảo mật hệ thống</Label>
                      <p className="text-sm text-muted-foreground">
                        Cài đặt bảo mật và quyền truy cập cho hệ thống
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="system-logging">Ghi log hệ thống</Label>
                          <p className="text-sm text-muted-foreground">
                            Ghi lại tất cả hoạt động của hệ thống
                          </p>
                        </div>
                        <Switch id="system-logging" defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quản lý dữ liệu</CardTitle>
                  <CardDescription>
                    Xuất hoặc xóa dữ liệu tài khoản của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Xuất dữ liệu</Label>
                      <p className="text-sm text-muted-foreground">
                        Tải xuống tất cả dữ liệu tài khoản của bạn
                      </p>
                    </div>
                    <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Xuất dữ liệu
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-destructive">Xóa tài khoản</Label>
                      <p className="text-sm text-muted-foreground">
                        Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="delete-confirm"
                        checked={deleteAccountConfirm}
                        onChange={(e) => setDeleteAccountConfirm(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="delete-confirm" className="text-sm">
                        Tôi hiểu rằng hành động này không thể hoàn tác
                      </Label>
                    </div>
                    <Button
                      onClick={handleDeleteAccount}
                      variant="destructive"
                      disabled={!deleteAccountConfirm}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa tài khoản
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="mt-6 flex justify-end gap-4">
            <Button onClick={saveSettings} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Lưu tất cả thay đổi
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;

