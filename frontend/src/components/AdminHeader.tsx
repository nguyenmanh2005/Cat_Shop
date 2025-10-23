import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Bell, 
  Settings, 
  User,
  Moon,
  Sun,
  Home,
  Menu
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

const AdminHeader = ({ onToggleSidebar }: AdminHeaderProps) => {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Here you would implement theme switching logic
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "/"}
            className="hidden sm:flex"
          >
            <Home className="h-4 w-4 mr-2" />
            Về trang chủ
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleTheme}
            className="hidden sm:flex"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">
                {user?.fullName}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
              </p>
            </div>
            
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </Button>
              
              {/* Dropdown Menu (simplified for now) */}
              <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg hidden">
                <div className="py-1">
                  <button className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent">
                    <User className="h-4 w-4 mr-2 inline" />
                    Hồ sơ
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent">
                    <Settings className="h-4 w-4 mr-2 inline" />
                    Cài đặt
                  </button>
                  <hr className="my-1" />
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="mt-4 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
            className="pl-10"
          />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
