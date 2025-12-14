import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp,
  TrendingDown,
  Users,
  PawPrint,
  ShoppingCart,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalPets: number;
  totalOrders: number;
  totalRevenue: number;
  userGrowth: number;
  petGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
  monthlyData: {
    month: string;
    users: number;
    pets: number;
    orders: number;
    revenue: number;
  }[];
  topBreeds: {
    breed: string;
    count: number;
    percentage: number;
  }[];
  orderStatusDistribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState("30days");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = () => {
      try {
        // Load data from localStorage
        const usersData = localStorage.getItem("cham_pets_users");
        const petsData = localStorage.getItem("cham_pets_pets");
        const ordersData = localStorage.getItem("cham_pets_orders");

        const users = usersData ? JSON.parse(usersData) : [];
        const pets = petsData ? JSON.parse(petsData) : [];
        const orders = ordersData ? JSON.parse(ordersData) : [];

        // Calculate analytics
        const totalRevenue = orders.reduce((sum: number, order: any) => {
          const amount = parseFloat(order.amount.replace(/[^\d]/g, ''));
          return sum + amount;
        }, 0);

        // Mock growth data (in real app, you'd calculate this from historical data)
        const mockData: AnalyticsData = {
          totalUsers: users.length,
          totalPets: pets.length,
          totalOrders: orders.length,
          totalRevenue: totalRevenue,
          userGrowth: 12.5,
          petGrowth: 8.3,
          orderGrowth: 15.2,
          revenueGrowth: 18.7,
          monthlyData: [
            { month: "T1", users: 1200, pets: 85, orders: 145, revenue: 2200000000 },
            { month: "T2", users: 1250, pets: 87, orders: 152, revenue: 2350000000 },
            { month: "T3", users: 1247, pets: 89, orders: 156, revenue: 2450000000 },
          ],
          topBreeds: [
            { breed: "Bengal", count: 15, percentage: 16.9 },
            { breed: "British Shorthair", count: 12, percentage: 13.5 },
            { breed: "Maine Coon", count: 10, percentage: 11.2 },
            { breed: "Persian", count: 8, percentage: 9.0 },
            { breed: "Ragdoll", count: 7, percentage: 7.9 },
            { breed: "Mèo ta", count: 6, percentage: 6.7 },
            { breed: "Khác", count: 31, percentage: 34.8 },
          ],
          orderStatusDistribution: [
            { status: "delivered", count: 45, percentage: 28.8 },
            { status: "shipping", count: 23, percentage: 14.7 },
            { status: "confirmed", count: 18, percentage: 11.5 },
            { status: "pending", count: 12, percentage: 7.7 },
            { status: "cancelled", count: 8, percentage: 5.1 },
          ]
        };

        setAnalyticsData(mockData);
      } catch (error) {
        console.error("Error loading analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-blue-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-blue-600" : "text-red-600";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Không thể tải dữ liệu phân tích</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Phân tích & Báo cáo</h1>
          <p className="text-muted-foreground">
            Thống kê và phân tích hiệu suất hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 ngày</SelectItem>
              <SelectItem value="30days">30 ngày</SelectItem>
              <SelectItem value="90days">90 ngày</SelectItem>
              <SelectItem value="1year">1 năm</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getGrowthIcon(analyticsData.userGrowth)}
              <span className={getGrowthColor(analyticsData.userGrowth)}>
                +{analyticsData.userGrowth}%
              </span>
              <span className="text-muted-foreground">từ tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Mèo</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalPets}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getGrowthIcon(analyticsData.petGrowth)}
              <span className={getGrowthColor(analyticsData.petGrowth)}>
                +{analyticsData.petGrowth}%
              </span>
              <span className="text-muted-foreground">từ tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getGrowthIcon(analyticsData.orderGrowth)}
              <span className={getGrowthColor(analyticsData.orderGrowth)}>
                +{analyticsData.orderGrowth}%
              </span>
              <span className="text-muted-foreground">từ tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.totalRevenue)}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getGrowthIcon(analyticsData.revenueGrowth)}
              <span className={getGrowthColor(analyticsData.revenueGrowth)}>
                +{analyticsData.revenueGrowth}%
              </span>
              <span className="text-muted-foreground">từ tháng trước</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Xu hướng hàng tháng
            </CardTitle>
            <CardDescription>Thống kê theo tháng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.monthlyData.map((month, index) => (
                <div key={month.month} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{month.month}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(month.revenue)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>{month.users}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PawPrint className="h-4 w-4 text-blue-600" />
                      <span>{month.pets}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                      <span>{month.orders}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Breeds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Giống mèo phổ biến
            </CardTitle>
            <CardDescription>Phân bố theo giống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topBreeds.map((breed, index) => (
                <div key={breed.breed} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{breed.breed}</span>
                    <span className="text-sm text-muted-foreground">
                      {breed.count} ({breed.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${breed.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Phân bố trạng thái đơn hàng
          </CardTitle>
          <CardDescription>Thống kê trạng thái đơn hàng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {analyticsData.orderStatusDistribution.map((status) => (
              <div key={status.status} className="text-center space-y-2">
                <div className="text-2xl font-bold">{status.count}</div>
                <div className="text-sm text-muted-foreground">
                  {getStatusLabel(status.status)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {status.percentage}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
