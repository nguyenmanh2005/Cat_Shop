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
  User,
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

interface Role {
  role_id: number;
  role_name: string;
}

interface User {
  user_id: number;
  username: string;
  password_hash: string;
  email: string;
  phone?: string;
  address?: string;
  role_id: number;
  role_name?: string;
  order_count?: number;
  total_spent?: number;
}

const UserManagementDB = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Load mock data
  useEffect(() => {
    const loadData = () => {
      try {
        // Mock Roles
        const mockRoles: Role[] = [
          { role_id: 1, role_name: "Admin" },
          { role_id: 2, role_name: "User" },
          { role_id: 3, role_name: "Moderator" }
        ];

        // Mock Users
        const mockUsers: User[] = [
          {
            user_id: 1,
            username: "admin",
            password_hash: "hashed_password_123",
            email: "admin@champets.com",
            phone: "0123456789",
            address: "123 Đường ABC, Quận 1, TP.HCM",
            role_id: 1,
            role_name: "Admin",
            order_count: 0,
            total_spent: 0
          },
          {
            user_id: 2,
            username: "nguyenvana",
            password_hash: "hashed_password_456",
            email: "nguyenvana@email.com",
            phone: "0987654321",
            address: "456 Đường XYZ, Quận 2, TP.HCM",
            role_id: 2,
            role_name: "User",
            order_count: 3,
            total_spent: 15700000
          },
          {
            user_id: 3,
            username: "tranthib",
            password_hash: "hashed_password_789",
            email: "tranthib@email.com",
            phone: "0369852147",
            address: "789 Đường DEF, Quận 3, TP.HCM",
            role_id: 2,
            role_name: "User",
            order_count: 2,
            total_spent: 800000
          },
          {
            user_id: 4,
            username: "levanc",
            password_hash: "hashed_password_101",
            email: "levanc@email.com",
            phone: "0741852963",
            address: "321 Đường GHI, Quận 4, TP.HCM",
            role_id: 2,
            role_name: "User",
            order_count: 1,
            total_spent: 120000
          },
          {
            user_id: 5,
            username: "moderator1",
            password_hash: "hashed_password_202",
            email: "moderator@champets.com",
            phone: "0527419638",
            address: "654 Đường JKL, Quận 5, TP.HCM",
            role_id: 3,
            role_name: "Moderator",
            order_count: 0,
            total_spent: 0
          }
        ];

        setRoles(mockRoles);
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
      filtered = filtered.filter(user => user.role_id.toString() === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const handleDeleteUser = (userId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa user này?")) {
      const updatedUsers = users.filter(user => user.user_id !== userId);
      setUsers(updatedUsers);
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
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
      ['ID', 'Username', 'Email', 'Số điện thoại', 'Địa chỉ', 'Vai trò', 'Số đơn hàng', 'Tổng chi tiêu'],
      ...filteredUsers.map(user => [
        user.user_id,
        user.username,
        user.email,
        user.phone || '',
        user.address || '',
        user.role_name,
        user.order_count,
        formatCurrency(user.total_spent || 0)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
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
                      {roles.map(role => (
                        <SelectItem key={role.role_id} value={role.role_id.toString()}>
                          {role.role_name}
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
              {users.filter(u => u.role_name === 'Admin').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role_name === 'User').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Moderator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role_name === 'Moderator').length}
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
                {roles.map(role => (
                  <SelectItem key={role.role_id} value={role.role_id.toString()}>
                    {role.role_name}
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
                    <TableRow key={user.user_id}>
                      <TableCell className="font-mono text-sm">{user.user_id}</TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>{getRoleBadge(user.role_name || 'User')}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.order_count} đơn</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(user.total_spent || 0)}
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
                              onClick={() => handleDeleteUser(user.user_id)}
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
                  <p className="font-mono">{selectedUser.user_id}</p>
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
                  <div>{getRoleBadge(selectedUser.role_name || 'User')}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Số đơn hàng</label>
                  <p>{selectedUser.order_count} đơn hàng</p>
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
                    <p className="text-lg font-semibold">{selectedUser.order_count} đơn</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tổng chi tiêu</label>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(selectedUser.total_spent || 0)}
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
