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
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
  Download,
  MoreHorizontal,
  Shield,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { userService } from "@/services/userService";
import { orderService } from "@/services/orderService";
import type { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { formatCurrencyVND } from "@/lib/utils";

interface AdminRole {
  id: string;
  name: string;
}

interface UserSummary {
  userId: number;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  roleName: string;
  orderCount: number;
  totalSpent: number;
}

const UserManagementDB = () => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserSummary[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const resolveRoleName = (user: Partial<User> & Record<string, any>): string => {
    const rawRole =
      user.role?.roleName ??
      user.role?.roleName ??
      user.roleName ??
      user.role_name;
    if (rawRole) {
      return rawRole;
    }
    const roleId = user.roleId ?? user.role_id;
    if (roleId === 1) return "Admin";
    if (roleId === 3) return "Moderator";
    return "User";
  };

  const normalizeUser = (
    user: Partial<User> & Record<string, any>,
    orderStats: Map<number, { count: number; total: number }>
  ): UserSummary => {
    const userId =
      user.userId ??
      user.user_id ??
      user.id ??
      Number(user.userID) ??
      0;
    const stats = orderStats.get(userId) || { count: 0, total: 0 };
    return {
      userId,
      username: user.username || user.fullName || user.email || `user-${userId}`,
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      roleName: resolveRoleName(user),
      orderCount: stats.count,
      totalSpent: stats.total,
    };
  };

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [allUsers, allOrders] = await Promise.all([
          userService.getAllUsers(),
          orderService.getAllOrders().catch(() => []),
        ]);

        if (ignore) return;

        const orderStats = new Map<number, { count: number; total: number }>();
        (allOrders || []).forEach((order: any) => {
          const userId =
            order.user_id ??
            order.userId ??
            order.user?.userId ??
            order.user?.user_id;
          if (!userId) return;
          const bucket = orderStats.get(userId) || { count: 0, total: 0 };
          bucket.count += 1;
          bucket.total += Number(order.total_amount ?? order.totalAmount ?? 0);
          orderStats.set(userId, bucket);
        });

        const normalizedUsers = (allUsers || []).map((user) =>
          normalizeUser(user, orderStats)
        );

        const uniqueRoles = Array.from(
          new Set(normalizedUsers.map((user) => user.roleName))
        ).map((roleName) => ({
          id: roleName.toLowerCase(),
          name: roleName,
        }));

        setRoles(uniqueRoles);
        setUsers(normalizedUsers);
        setFilteredUsers(normalizedUsers);
      } catch (error: any) {
        if (ignore) return;
        console.error("Failed to load user database view:", error);
        toast({
          title: "Không thể tải user từ API",
          description: error?.message || "Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      ignore = true;
    };
  }, [toast]);

  // Filter users
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.roleName === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa user này?")) return;
    try {
      await userService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.userId !== userId));
      setFilteredUsers(prev => prev.filter(user => user.userId !== userId));
      toast({
        title: "Đã xóa user",
        description: `User #${userId} đã được xóa khỏi hệ thống.`,
      });
    } catch (error: any) {
      console.error("Delete user error:", error);
      toast({
        title: "Xóa user thất bại",
        description: error?.message || "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (user: UserSummary) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const getRoleBadge = (roleName: string) => {
    const variants = {
      Admin: 'destructive',
      User: 'default',
      Moderator: 'secondary'
    } as const;

    return (
      <Badge variant={variants[roleName as keyof typeof variants] || 'default'}>
        {roleName}
      </Badge>
    );
  };

  const handleExportUsers = () => {
    const csvContent = [
      ["ID", "Username", "Email", "Số điện thoại", "Địa chỉ", "Vai trò", "Số đơn hàng", "Tổng chi tiêu"],
      ...filteredUsers.map(user => [
        user.userId,
        user.username,
        user.email,
        user.phone || "",
        user.address || "",
        user.roleName,
        user.orderCount,
        user.totalSpent,
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
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
          <h1 className="text-2xl font-bold">Quản lý Users (Database)</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả users từ database
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Xuất CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm user mới</DialogTitle>
                <DialogDescription>
                  Tạo tài khoản user mới trong hệ thống
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <Input placeholder="Nhập username..." />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input placeholder="Nhập email..." type="email" />
                </div>
                <div>
                  <label className="text-sm font-medium">Mật khẩu</label>
                  <Input placeholder="Nhập mật khẩu..." type="password" />
                </div>
                <div>
                  <label className="text-sm font-medium">Số điện thoại</label>
                  <Input placeholder="Nhập số điện thoại..." />
                </div>
                <div>
                  <label className="text-sm font-medium">Địa chỉ</label>
                  <Input placeholder="Nhập địa chỉ..." />
                </div>
                <div>
                  <label className="text-sm font-medium">Vai trò</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(false)}>
                    Thêm User
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.roleName === 'Admin').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.roleName === 'User').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Moderator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.roleName === 'Moderator').length}
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
                  placeholder="Tìm kiếm theo username, email, SĐT, địa chỉ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Hiển thị {filteredUsers.length} trong tổng số {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Đơn hàng</TableHead>
                  <TableHead>Tổng chi tiêu</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy user nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell className="font-mono text-sm">{user.userId}</TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>{getRoleBadge(user.roleName)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.orderCount} đơn</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-blue-600">
                        {formatCurrencyVND(user.totalSpent)}
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
                            <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              Đổi vai trò
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user.userId)}
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

      {/* User Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết User</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">User ID</label>
                  <p className="font-mono">{selectedUser.userId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <p className="font-semibold">{selectedUser.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p>{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Số điện thoại</label>
                  <p>{selectedUser.phone || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Vai trò</label>
                  <div>{getRoleBadge(selectedUser.roleName)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Số đơn hàng</label>
                  <p>{selectedUser.orderCount} đơn hàng</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Địa chỉ</label>
                <p className="text-muted-foreground">{selectedUser.address || 'Chưa cập nhật'}</p>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Thống kê mua hàng</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Tổng đơn hàng</label>
                    <p className="text-lg font-semibold">{selectedUser.orderCount} đơn</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tổng chi tiêu</label>
                    <p className="text-lg font-semibold text-blue-600">
                      {formatCurrencyVND(selectedUser.totalSpent)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementDB;
