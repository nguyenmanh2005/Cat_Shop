import { useState } from "react";
import { useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import AdminSidebar from "@/components/AdminSidebar";
import AdminDashboard from "@/components/AdminDashboard";
import UserManagement from "@/components/admin/UserManagement";
import PetManagement from "@/components/admin/PetManagement";
import OrderManagement from "@/components/admin/OrderManagement";
import Analytics from "@/components/admin/Analytics";
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
      window.location.href = "/";
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
    return null; // Will redirect
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
          {activeTab === "users" && (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Quản lý Users</h1>
              <p className="text-muted-foreground">Chức năng quản lý users chi tiết...</p>
            </div>
          )}
          {activeTab === "pets" && (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Quản lý Mèo</h1>
              <p className="text-muted-foreground">Chức năng quản lý mèo chi tiết...</p>
            </div>
          )}
          {activeTab === "orders" && (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Quản lý Đơn hàng</h1>
              <p className="text-muted-foreground">Chức năng quản lý đơn hàng chi tiết...</p>
            </div>
          )}
          {activeTab === "analytics" && <Analytics />}
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
