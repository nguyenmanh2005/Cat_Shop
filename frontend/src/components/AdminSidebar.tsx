import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Users, 
  PawPrint, 
  ShoppingCart, 
  Settings, 
  BarChart3,
  Bell,
  FileText,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bug,
  Key,
  Star,
  Utensils
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: "users",
      label: "Quản lý Users",
      icon: Users,
      badge: "12"
    },
    {
      id: "users-db",
      label: "Users (Database)",
      icon: Users,
      badge: "5"
    },
    {
      id: "products",
      label: "Quản lý Sản phẩm",
      icon: PawPrint,
      badge: "25"
    },
    {
      id: "admin-products",
      label: "Products (CRUD)",
      icon: PawPrint,
      badge: "New"
    },
    {
      id: "categories",
      label: "Quản lý Danh mục",
      icon: FileText,
      badge: "8"
    },
    {
      id: "admin-categories",
      label: "Categories (CRUD)",
      icon: FileText,
      badge: "New"
    },
    {
      id: "orders",
      label: "Đơn hàng",
      icon: ShoppingCart,
      badge: "156"
    },
    {
      id: "orders-db",
      label: "Đơn hàng (Database)",
      icon: ShoppingCart,
      badge: "5"
    },
    {
      id: "analytics",
      label: "Phân tích",
      icon: BarChart3,
      badge: null
    },
    {
      id: "admin-reviews",
      label: "Quản lý Reviews",
      icon: Star,
      badge: "New"
    },
    {
      id: "cat-details",
      label: "Quản lý Cat Details",
      icon: PawPrint,
      badge: "New"
    },
    {
      id: "food-details",
      label: "Quản lý Food Details",
      icon: Utensils,
      badge: "New"
    },
    {
      id: "debug",
      label: "Debug Auth",
      icon: Bug,
      badge: "Test"
    },
    {
      id: "credentials",
      label: "Admin Credentials",
      icon: Key,
      badge: "Info"
    },
    {
      id: "notifications",
      label: "Thông báo",
      icon: Bell,
      badge: "3"
    },
    {
      id: "reports",
      label: "Báo cáo",
      icon: FileText,
      badge: null
    },
    {
      id: "security",
      label: "Bảo mật",
      icon: Shield,
      badge: null
    },
    {
      id: "settings",
      label: "Cài đặt",
      icon: Settings,
      badge: null
    }
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className={`bg-background border-r border-border transition-all duration-300 ${
      isCollapsed ? "w-16" : "w-64"
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Cham Pets</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* User Info */}
        {!isCollapsed && user && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-10 ${
                  isCollapsed ? "px-2" : "px-3"
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 ${
              isCollapsed ? "px-2" : "px-3"
            }`}
            onClick={handleLogout}
          >
            <LogOut className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
            {!isCollapsed && <span>Đăng xuất</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
