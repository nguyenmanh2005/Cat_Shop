import { useState, useEffect } from "react";
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
import { userService } from "@/services/userService";
import { petService } from "@/services/petService";
import { orderService } from "@/services/orderService";
import { formatCurrencyVND, formatDateTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalUsers: number;
  totalPets: number;
  totalOrders: number;
  revenue: number;
  userGrowth: number;
  orderGrowth: number;
}

interface RecentUser {
  id: number;
  name: string;
  email?: string;
  joinedAt?: string;
  status: "active" | "inactive";
}

interface RecentOrder {
  id: number;
  customer: string;
  pet?: string;
  amount: number;
  status: "completed" | "pending" | "shipping" | "delivered" | "cancelled";
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPets: 0,
    totalOrders: 0,
    revenue: 0,
    userGrowth: 0,
    orderGrowth: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let ignore = false;

    const fetchDashboardData = async () => {
      try {
        setIsStatsLoading(true);
        const [usersResponse, petsResponse, ordersResponse] = await Promise.all([
          userService.getAllUsers().catch(() => []),
          petService.getAllPets().catch(() => []),
          orderService.getAllOrders().catch(() => []),
        ]);

        if (ignore) return;

        const normalizedUsers: RecentUser[] = (usersResponse || [])
          .map((user: any, index: number) => {
            const rawId = user.userId ?? user.user_id ?? user.id;
            const id = typeof rawId === "number" && rawId > 0 ? rawId : index + 1;
            return {
              id,
              name: user.username ?? user.fullName ?? user.email ?? `User #${id}`,
              email: user.email,
              joinedAt: user.createdAt ?? user.created_at,
              status: "active",
            };
          })
          .sort((a, b) => b.id - a.id)
          .slice(0, 4);

        const normalizedOrders: RecentOrder[] = (ordersResponse || [])
          .map((order: any) => {
            const orderId = order.order_id ?? order.orderId ?? order.id ?? 0;
            const userId = order.userId ?? order.user_id;
            return {
              id: orderId,
              customer: order.user?.username ?? order.customerName ?? (userId ? `Khách #${userId}` : `Đơn #${orderId}`),
              pet: order.order_details?.[0]?.product?.productName ?? order.petName,
              amount: Number(order.total_amount ?? order.totalAmount ?? 0),
              status: (order.status ?? "pending").toLowerCase(),
            };
          })
          .slice(0, 4);

        const totalOrders = (ordersResponse || []).length;
        const revenue = (ordersResponse || []).reduce(
          (sum: number, order: any) => sum + Number(order.total_amount ?? order.totalAmount ?? 0),
          0
        );

        setStats({
          totalUsers: (usersResponse || []).length,
          totalPets: (petsResponse || []).length,
          totalOrders,
          revenue,
          userGrowth: 0,
          orderGrowth: 0,
        });
        setRecentUsers(normalizedUsers);
        setRecentOrders(normalizedOrders);
      } catch (error: any) {
        if (ignore) return;
        console.error("Dashboard data error:", error);
        toast({
          title: "Không thể tải dữ liệu thống kê",
          description: error?.message || "Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        if (!ignore) {
          setIsStatsLoading(false);
        }
      }
    };

    fetchDashboardData();
    return () => {
      ignore = true;
    };
  }, [toast]);

  const renderUserStatus = (status: "active" | "inactive") => (
    <Badge variant={status === "active" ? "default" : "secondary"}>
      {status === "active" ? "Hoạt động" : "Không hoạt động"}
    </Badge>
  );

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
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{stats.userGrowth}%</span> từ tháng trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Mèo</CardTitle>
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPets}</div>
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
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{stats.orderGrowth}%</span> từ tháng trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isStatsLoading ? "..." : formatCurrencyVND(stats.revenue)}
              </div>
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
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.joinedAt ? formatDateTime(user.joinedAt) : "—"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {renderUserStatus(user.status)}
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
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">{order.pet || "—"}</p>
                        <p className="text-sm font-medium text-green-600">
                          {formatCurrencyVND(order.amount)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(order.status as any)}
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
