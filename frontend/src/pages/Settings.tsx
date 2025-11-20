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
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language, setLanguage, tSync } = useLanguage();

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
    // Load saved settings from localStorage
    loadSettings();
  }, []);

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
      title: tSync("settings.saved"),
      description: tSync("settings.saved.description"),
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
      title: tSync("settings.data.export.success"),
      description: tSync("settings.data.export.description"),
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
      title: tSync("settings.delete.title"),
      description: tSync("settings.delete.description"),
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <SettingsIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                {tSync("settings.title")}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {tSync("settings.subtitle")}
            </p>
          </div>

          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">{tSync("notifications.title")}</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">{tSync("appearance.title")}</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">{tSync("privacy.title")}</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{tSync("account.title")}</span>
              </TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    {tSync("notifications.email.title")}
                  </CardTitle>
                  <CardDescription>
                    {tSync("notifications.email.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {tSync("notifications.email.enable")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {tSync("notifications.email.enable.desc")}
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
                      <Label htmlFor="order-updates">{tSync("notifications.order.updates")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {tSync("notifications.order.updates.desc")}
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
                      <Label htmlFor="promotional-emails">{tSync("notifications.promotional")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {tSync("notifications.promotional.desc")}
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
                        {tSync("notifications.security")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {tSync("notifications.security.desc")}
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
                    {tSync("notifications.push.title")}
                  </CardTitle>
                  <CardDescription>
                    {tSync("notifications.push.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">{tSync("notifications.push.enable")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {tSync("notifications.push.enable.desc")}
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
                    {tSync("appearance.title")}
                  </CardTitle>
                  <CardDescription>
                    {tSync("appearance.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">{tSync("appearance.theme")}</Label>
                    <Select 
                      value={theme || "system"} 
                      onValueChange={(value) => {
                        setTheme(value as "light" | "dark" | "system");
                        toast({
                          title: tSync("theme.changed"),
                          description: `${tSync("theme.current")}: ${value === "light" ? tSync("theme.light") : value === "dark" ? tSync("theme.dark") : tSync("theme.system")}`,
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
                            {tSync("theme.light")}
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            {tSync("theme.dark")}
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            {tSync("theme.system")}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {tSync("theme.current")}: {resolvedTheme === "dark" ? tSync("theme.dark") : tSync("theme.light")} {theme === "system" && `(${tSync("theme.system")})`}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="language" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {tSync("appearance.language")}
                    </Label>
                    <Select 
                      value={language} 
                      onValueChange={(value) => {
                        setLanguage(value as "vi" | "en" | "zh" | "ja");
                        toast({
                          title: tSync("language.changed"),
                          description: `${tSync("language.current")}: ${tSync(`language.${value}`)}`,
                        });
                      }}
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">{tSync("language.vi")}</SelectItem>
                        <SelectItem value="en">{tSync("language.en")}</SelectItem>
                        <SelectItem value="zh">{tSync("language.zh")}</SelectItem>
                        <SelectItem value="ja">{tSync("language.ja")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {tSync("language.current")}: {tSync(`language.${language}`)}
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-mode">{tSync("appearance.compact")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {tSync("appearance.compact.desc")}
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
                    {tSync("privacy.title")}
                  </CardTitle>
                  <CardDescription>
                    {tSync("privacy.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="profile-visibility">{tSync("privacy.profile")}</Label>
                    <Select value={profileVisibility} onValueChange={(value) => setProfileVisibility(value as "public" | "private" | "friends")}>
                      <SelectTrigger id="profile-visibility">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <span>{tSync("privacy.profile.public")}</span>
                            <Badge variant="outline">{tSync("privacy.profile.public.badge")}</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="friends">
                          <div className="flex items-center gap-2">
                            <span>{tSync("privacy.profile.friends")}</span>
                            <Badge variant="outline">{tSync("privacy.profile.friends.badge")}</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <span>{tSync("privacy.profile.private")}</span>
                            <Badge variant="outline">{tSync("privacy.profile.private.badge")}</Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {tSync("privacy.profile.desc")}
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-email">{tSync("privacy.email")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {tSync("privacy.email.desc")}
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
                      <Label htmlFor="show-phone">{tSync("privacy.phone")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {tSync("privacy.phone.desc")}
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
                      <Label htmlFor="data-sharing">{tSync("privacy.data.sharing")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {tSync("privacy.data.sharing.desc")}
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
                      <Label htmlFor="analytics">{tSync("privacy.analytics")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {tSync("privacy.analytics.desc")}
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

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{tSync("account.data.title")}</CardTitle>
                  <CardDescription>
                    {tSync("account.data.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{tSync("account.export.label")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {tSync("account.export.desc")}
                      </p>
                    </div>
                    <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      {tSync("account.export")}
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-destructive">{tSync("account.delete.label")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {tSync("account.delete.desc")}
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
                        {tSync("account.delete.confirm")}
                      </Label>
                    </div>
                    <Button
                      onClick={handleDeleteAccount}
                      variant="destructive"
                      disabled={!deleteAccountConfirm}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {tSync("account.delete")}
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
              {tSync("settings.save")}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;

