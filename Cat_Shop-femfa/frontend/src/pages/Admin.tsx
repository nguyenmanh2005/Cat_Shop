import { useState } from "react";
import { useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import AdminSidebar from "@/components/AdminSidebar";
import AdminDashboard from "@/components/AdminDashboard";
import UserManagement from "@/components/admin/UserManagement";
import PetManagement from "@/components/admin/PetManagement";
import OrderManagement from "@/components/admin/OrderManagement";
import UserManagementDB from "@/components/admin/UserManagementDB";
import ProductManagement from "@/components/admin/ProductManagement";
import CategoryManagement from "@/components/admin/CategoryManagement";
import OrderManagementDB from "@/components/admin/OrderManagementDB";
import Analytics from "@/components/admin/Analytics";
import { DebugAuth } from "@/components/DebugAuth";
import { AdminCredentials } from "@/components/AdminCredentials";
import { useAuth } from "@/contexts/AuthContext";

const Admin = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = "Admin Panel - Cham Pets";
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      console.log("Admin Panel Access Denied:", { user, isAdmin, isLoading });
      // Delay redirect để có thể thấy thông báo
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  }, [user, isAdmin, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="mb-4">
            <svg className="h-16 w-16 text-destructive mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Không có quyền truy cập</h1>
          <p className="text-muted-foreground mb-4">
            Bạn cần đăng nhập với tài khoản admin để truy cập Admin Panel.
          </p>
          <p className="text-sm text-muted-foreground">
            Đang chuyển hướng về trang chủ...
          </p>
        </div>
      </div>
    );
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader onToggleSidebar={handleToggleSidebar} />
      
      <div className="flex">
        {/* Sidebar */}
        <div className={`hidden lg:block ${sidebarOpen ? 'lg:block' : ''}`}>
          <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50" 
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-background">
              <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "users-db" && <UserManagementDB />}
          {activeTab === "products" && <ProductManagement />}
          {activeTab === "categories" && <CategoryManagement />}
          {activeTab === "pets" && <PetManagement />}
          {activeTab === "orders" && <OrderManagement />}
          {activeTab === "orders-db" && <OrderManagementDB />}
          {activeTab === "analytics" && <Analytics />}
          {activeTab === "debug" && <DebugAuth />}
          {activeTab === "credentials" && <AdminCredentials />}
          {activeTab === "notifications" && (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Thông báo</h1>
              <p className="text-muted-foreground">Quản lý thông báo hệ thống...</p>
            </div>
          )}
          {activeTab === "reports" && (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Báo cáo</h1>
              <p className="text-muted-foreground">Tạo và xem báo cáo...</p>
            </div>
          )}
          {activeTab === "security" && (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Bảo mật</h1>
              <p className="text-muted-foreground">Cài đặt bảo mật hệ thống...</p>
            </div>
          )}
          {activeTab === "settings" && (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Cài đặt</h1>
              <p className="text-muted-foreground">Cài đặt hệ thống...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
