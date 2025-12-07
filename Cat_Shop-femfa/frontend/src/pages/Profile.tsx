import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/userService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, MapPin, Save, Edit, QrCode } from "lucide-react";
import { User as UserType } from "@/types";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user: authUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    // Redirect nếu chưa đăng nhập
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    loadUserProfile();
  }, [isAuthenticated, navigate]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await userService.getProfile();
      setUser(profile);
      setFormData({
        username: profile.username || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin hồ sơ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (!user) return;

      await userService.updateUser(user.user_id, formData);
      
      setIsEditing(false);
      await loadUserProfile();
      
      toast({
        title: "Thành công",
        description: "Cập nhật thông tin hồ sơ thành công",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin hồ sơ",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
    setIsEditing(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col overflow-x-hidden page-transition">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-lg animate-pulse">Đang tải...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden page-transition">
      <Header />
      
      <main className="flex-1 py-8 animate-fade-in">
        <div className="max-w-4xl mx-auto px-6">
          {/* Page Header */}
          <div className="mb-8 animate-fade-in-down">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Thông tin cá nhân
            </h1>
            <p className="text-muted-foreground">
              Quản lý thông tin tài khoản của bạn
            </p>
          </div>

          {/* Profile Card */}
          <Card className="card-hover animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Hồ sơ của tôi
                  </CardTitle>
                  <CardDescription>
                    Cập nhật thông tin cá nhân của bạn
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Tên người dùng</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-9"
                      placeholder="Nhập tên người dùng"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-9"
                      placeholder="Nhập email"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-9"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-9"
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <Button onClick={handleSave} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Lưu thay đổi
                    </Button>
                    <Button onClick={handleCancel} variant="outline" className="flex-1">
                      Hủy
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Vai trò</span>
                  <span className="font-medium">
                    {user?.role_id === 1 ? "Quản trị viên" : "Người dùng"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">ID tài khoản</span>
                  <span className="font-medium">{user?.user_id}</span>
                </div>

                {/* Đăng nhập thiết bị khác bằng QR (giống Zalo) */}
                <div className="pt-2 border-t mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Đang đăng nhập trên điện thoại? Bạn có thể dùng mã QR để đăng nhập nhanh trên thiết bị khác.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => {
                      navigate("/qr-login");
                    }}
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Quét mã QR để đăng nhập thiết bị khác</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
