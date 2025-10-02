import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  PawPrint, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Activity,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import UserManagement from "./admin/UserManagement";
import PetManagement from "./admin/PetManagement";
import OrderManagement from "./admin/OrderManagement";
import Analytics from "./admin/Analytics";

// Mock data
const mockStats = {
  totalUsers: 1247,
  totalPets: 89,
  totalOrders: 156,
  revenue: 2450000000,
  userGrowth: 12.5,
  orderGrowth: 8.3
};

const mockRecentUsers = [
  { id: 1, name: "Nguyễn Văn A", email: "user1@email.com", joinDate: "2024-01-15", status: "active" },
  { id: 2, name: "Trần Thị B", email: "user2@email.com", joinDate: "2024-01-14", status: "active" },
  { id: 3, name: "Lê Văn C", email: "user3@email.com", joinDate: "2024-01-13", status: "inactive" },
  { id: 4, name: "Phạm Thị D", email: "user4@email.com", joinDate: "2024-01-12", status: "active" },
];

const mockRecentOrders = [
  { id: 1, customer: "Nguyễn Văn A", pet: "Mèo Bengal", amount: "15.000.000 VNĐ", status: "completed" },
  { id: 2, customer: "Trần Thị B", pet: "Mèo Persian", amount: "5.500.000 VNĐ", status: "pending" },
  { id: 3, customer: "Lê Văn C", pet: "Mèo Maine Coon", amount: "12.000.000 VNĐ", status: "shipping" },
  { id: 4, customer: "Phạm Thị D", pet: "Mèo Ragdoll", amount: "8.000.000 VNĐ", status: "completed" },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
      completed: "default",
      pending: "secondary",
      shipping: "outline",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status === "active" ? "Hoạt động" : 
         status === "inactive" ? "Không hoạt động" :
         status === "completed" ? "Hoàn thành" :
         status === "pending" ? "Chờ xử lý" :
         status === "shipping" ? "Đang giao" : status}
      </Badge>
    );
  };

  return (
    <div className="flex-1 p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
          <p className="text-muted-foreground">Quản lý hệ thống Cham Pets</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{mockStats.userGrowth}%</span> từ tháng trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Mèo</CardTitle>
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalPets}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+3</span> mèo mới tuần này
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{mockStats.orderGrowth}%</span> từ tháng trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(mockStats.revenue)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15.2%</span> từ tháng trước
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
          >
            Tổng quan
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
          >
            Quản lý Users
          </Button>
          <Button
            variant={activeTab === "pets" ? "default" : "outline"}
            onClick={() => setActiveTab("pets")}
          >
            Quản lý Mèo
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "outline"}
            onClick={() => setActiveTab("orders")}
          >
            Quản lý Đơn hàng
          </Button>
        </div>

        {/* Content based on active tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle>Users gần đây</CardTitle>
                <CardDescription>Danh sách users mới đăng ký</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.joinDate}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(user.status)}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Đơn hàng gần đây</CardTitle>
                <CardDescription>Các đơn hàng mới nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">{order.pet}</p>
                        <p className="text-sm font-medium text-green-600">{order.amount}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(order.status)}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "users" && <UserManagement />}

        {activeTab === "pets" && <PetManagement />}

        {activeTab === "orders" && <OrderManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;
