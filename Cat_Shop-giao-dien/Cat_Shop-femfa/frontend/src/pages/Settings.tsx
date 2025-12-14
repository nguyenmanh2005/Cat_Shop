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

  // Helper function to get language display name
  const getLanguageName = (lang: string) => {
    const names: Record<string, string> = {
      vi: "Tiếng Việt",
      en: "English",
      zh: "中文",
      ja: "日本語",
    };
    return names[lang] || lang;
  };

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
      title: "Settings Saved",
      description: "All changes have been saved successfully.",
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
      title: "Data Exported",
      description: "Your settings have been downloaded.",
    });
  };

  const handleDeleteAccount = () => {
    if (!deleteAccountConfirm) {
      toast({
        title: "Confirm Account Deletion",
        description: "Please check the confirmation box to continue.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Feature Under Development",
      description: "Account deletion feature will be implemented soon.",
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
                Settings
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="account" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription>
                    Manage notifications sent via email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive important notifications via email
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
                      <Label htmlFor="order-updates">Order Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications about your order status
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
                      <Label htmlFor="promotional-emails">Promotional Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive information about offers and new products
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
                        Security Alerts
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications about important security activities
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
                    Push Notifications
                  </CardTitle>
                  <CardDescription>
                    Receive notifications directly on your device
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Enable Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow sending notifications to your browser
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
                    Appearance
                  </CardTitle>
                  <CardDescription>
                    Customize your interface and experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select 
                      value={theme || "system"} 
                      onValueChange={(value) => {
                        setTheme(value as "light" | "dark" | "system");
                        toast({
                          title: "Theme Changed",
                          description: `Theme has been changed to ${value === "light" ? "Light" : value === "dark" ? "Dark" : "System"}`,
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
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Current theme: {resolvedTheme === "dark" ? "Dark" : "Light"} {theme === "system" && "(System)"}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="language" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Language
                    </Label>
                    <Select 
                      value={language} 
                      onValueChange={(value) => {
                        setLanguage(value as "vi" | "en" | "zh" | "ja");
                        toast({
                          title: "Language Changed",
                          description: `Language has been changed to ${getLanguageName(value)}`,
                        });
                      }}
                    >
                      <SelectTrigger id="language">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Current language: {getLanguageName(language)}
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-mode">Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Display more content on screen
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
                    Privacy
                  </CardTitle>
                  <CardDescription>
                    Control your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="profile-visibility">Profile Visibility</Label>
                    <Select value={profileVisibility} onValueChange={(value) => setProfileVisibility(value as "public" | "private" | "friends")}>
                      <SelectTrigger id="profile-visibility">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <span>Public</span>
                            <Badge variant="outline">Everyone</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="friends">
                          <div className="flex items-center gap-2">
                            <span>Friends</span>
                            <Badge variant="outline">Friends Only</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <span>Private</span>
                            <Badge variant="outline">Only Me</Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Who can view your profile
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-email">Show Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to view your email
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
                      <Label htmlFor="show-phone">Show Phone Number</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to view your phone number
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
                      <Label htmlFor="data-sharing">Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow sharing anonymous data to improve service
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
                      <Label htmlFor="analytics">Usage Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Collect data to analyze and improve experience
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
                      Admin Settings
                    </CardTitle>
                    <CardDescription>
                      Manage system settings and access permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-primary">
                          {user?.role === "admin" ? "Administrator" : "User"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {user?.email}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>System Management</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          onClick={() => navigate("/admin")}
                          className="flex items-center gap-2"
                        >
                          <SettingsIcon className="h-4 w-4" />
                          Dashboard
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate("/admin/categories")}
                          className="flex items-center gap-2"
                        >
                          <SettingsIcon className="h-4 w-4" />
                          Manage Categories
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Reports and Statistics</Label>
                      <p className="text-sm text-muted-foreground">
                        View system reports and statistics
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/admin")}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        View Reports
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>System Security</Label>
                      <p className="text-sm text-muted-foreground">
                        Security settings and access permissions for the system
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="system-logging">System Logging</Label>
                          <p className="text-sm text-muted-foreground">
                            Log all system activities
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
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>
                    Export or delete your account data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Export Data</Label>
                      <p className="text-sm text-muted-foreground">
                        Download all your account data
                      </p>
                    </div>
                    <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export Data
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-destructive">Delete Account</Label>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all your data. This action cannot be undone.
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
                        I understand that this action cannot be undone
                      </Label>
                    </div>
                    <Button
                      onClick={handleDeleteAccount}
                      variant="destructive"
                      disabled={!deleteAccountConfirm}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Account
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
              Save All Changes
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;

