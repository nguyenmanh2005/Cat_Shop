import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  ShoppingCart,
  Download,
  MoreHorizontal,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  user_id: number;
  username: string;
  email: string;
  phone: string;
  address: string;
}

interface Product {
  product_id: number;
  product_name: string;
  price: number;
}

interface Order {
  order_id: number;
  user_id: number;
  order_date: string;
  status: string;
  total_amount: number;
  user?: User;
  order_details?: OrderDetail[];
}

interface OrderDetail {
  order_detail_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: Product;
}

interface Payment {
  payment_id: number;
  order_id: number;
  payment_date: string;
  method: string;
  amount: number;
}

interface Shipment {
  shipment_id: number;
  order_id: number;
  shipping_address: string;
  shipped_date?: string;
  status: string;
}

const OrderManagementDB = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Load mock data
  useEffect(() => {
    const loadData = () => {
      try {
        // Mock Users
        const mockUsers: User[] = [
          { user_id: 1, username: "nguyenvana", email: "nguyenvana@email.com", phone: "0123456789", address: "123 Đường ABC, Quận 1, TP.HCM" },
          { user_id: 2, username: "tranthib", email: "tranthib@email.com", phone: "0987654321", address: "456 Đường XYZ, Quận 2, TP.HCM" },
          { user_id: 3, username: "levanc", email: "levanc@email.com", phone: "0369852147", address: "789 Đường DEF, Quận 3, TP.HCM" }
        ];

        // Mock Products
        const mockProducts: Product[] = [
          { product_id: 1, product_name: "Mèo Bengal", price: 15000000 },
          { product_id: 2, product_name: "Royal Canin Adult", price: 450000 },
          { product_id: 3, product_name: "Lồng vận chuyển nhựa", price: 350000 },
          { product_id: 4, product_name: "Cát vệ sinh Ever Clean", price: 120000 }
        ];

        // Mock Orders
        const mockOrders: Order[] = [
          {
            order_id: 1,
            user_id: 1,
            order_date: "2024-01-15T10:30:00Z",
            status: "pending",
            total_amount: 15000000,
            user: mockUsers[0],
            order_details: [
              {
                order_detail_id: 1,
                order_id: 1,
                product_id: 1,
                quantity: 1,
                price: 15000000,
                product: mockProducts[0]
              }
            ]
          },
          {
            order_id: 2,
            user_id: 2,
            order_date: "2024-01-14T14:20:00Z",
            status: "confirmed",
            total_amount: 800000,
            user: mockUsers[1],
            order_details: [
              {
                order_detail_id: 2,
                order_id: 2,
                product_id: 2,
                quantity: 1,
                price: 450000,
                product: mockProducts[1]
              },
              {
                order_detail_id: 3,
                order_id: 2,
                product_id: 3,
                quantity: 1,
                price: 350000,
                product: mockProducts[2]
              }
            ]
          },
          {
            order_id: 3,
            user_id: 3,
            order_date: "2024-01-13T09:15:00Z",
            status: "shipping",
            total_amount: 120000,
            user: mockUsers[2],
            order_details: [
              {
                order_detail_id: 4,
                order_id: 3,
                product_id: 4,
                quantity: 1,
                price: 120000,
                product: mockProducts[3]
              }
            ]
          },
          {
            order_id: 4,
            user_id: 1,
            order_date: "2024-01-12T16:45:00Z",
            status: "delivered",
            total_amount: 450000,
            user: mockUsers[0],
            order_details: [
              {
                order_detail_id: 5,
                order_id: 4,
                product_id: 2,
                quantity: 1,
                price: 450000,
                product: mockProducts[1]
              }
            ]
          },
          {
            order_id: 5,
            user_id: 2,
            order_date: "2024-01-11T11:30:00Z",
            status: "cancelled",
            total_amount: 350000,
            user: mockUsers[1],
            order_details: [
              {
                order_detail_id: 6,
                order_id: 5,
                product_id: 3,
                quantity: 1,
                price: 350000,
                product: mockProducts[2]
              }
            ]
          }
        ];

        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_id.toString().includes(searchTerm) ||
        order.user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.phone.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const handleUpdateStatus = (orderId: number, newStatus: string) => {
    const updatedOrders = orders.map(order => 
      order.order_id === orderId 
        ? { ...order, status: newStatus }
        : order
    );
    setOrders(updatedOrders);
  };

  const handleDeleteOrder = (orderId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
      const updatedOrders = orders.filter(order => order.order_id !== orderId);
      setOrders(updatedOrders);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      shipping: 'outline',
      delivered: 'default',
      cancelled: 'destructive'
    } as const;
    
    const labels = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'shipping':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const handleExportOrders = () => {
    const csvContent = [
      ['ID', 'Khách hàng', 'Email', 'SĐT', 'Ngày đặt', 'Trạng thái', 'Tổng tiền'],
      ...filteredOrders.map(order => [
        order.order_id,
        order.user?.username || '',
        order.user?.email || '',
        order.user?.phone || '',
        formatDate(order.order_date),
        getStatusBadge(order.status).props.children,
        formatCurrency(order.total_amount)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Đơn hàng (Database)</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả đơn hàng từ database
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportOrders}>
            <Download className="h-4 w-4 mr-2" />
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Đã xác nhận</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Đang giao</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {orders.filter(o => o.status === 'shipping').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Đã giao</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo ID, tên khách hàng, email, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="shipping">Đang giao</SelectItem>
                <SelectItem value="delivered">Đã giao</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Đơn hàng ({filteredOrders.length})</CardTitle>
          <CardDescription>
            Hiển thị {filteredOrders.length} trong tổng số {orders.length} đơn hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy đơn hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.order_id}>
                      <TableCell className="font-mono font-medium">{order.order_id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.user?.username}</div>
                          <div className="text-sm text-muted-foreground">{order.user?.email}</div>
                          <div className="text-sm text-muted-foreground">{order.user?.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.order_date)}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          {getStatusBadge(order.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(order.order_id, 'confirmed')}
                            >
                              Xác nhận đơn hàng
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(order.order_id, 'shipping')}
                            >
                              Đang giao hàng
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(order.order_id, 'delivered')}
                            >
                              Hoàn thành giao hàng
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(order.order_id, 'cancelled')}
                            >
                              Hủy đơn hàng
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteOrder(order.order_id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.order_id}</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về đơn hàng
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">ID đơn hàng</label>
                  <p className="font-mono">{selectedOrder.order_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Ngày đặt</label>
                  <p>{formatDate(selectedOrder.order_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Trạng thái</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedOrder.status)}
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Tổng tiền</label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(selectedOrder.total_amount)}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Thông tin khách hàng</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Tên đăng nhập</label>
                    <p>{selectedOrder.user?.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p>{selectedOrder.user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Số điện thoại</label>
                    <p>{selectedOrder.user?.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Địa chỉ</label>
                    <p>{selectedOrder.user?.address}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Sản phẩm trong đơn hàng</h4>
                <div className="space-y-2">
                  {selectedOrder.order_details?.map((detail) => (
                    <div key={detail.order_detail_id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">{detail.product?.product_name}</div>
                        <div className="text-sm text-muted-foreground">Số lượng: {detail.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(detail.price)}</div>
                        <div className="text-sm text-muted-foreground">
                          Tổng: {formatCurrency(detail.price * detail.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagementDB;
