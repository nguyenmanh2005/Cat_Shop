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
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  UserPlus,
  Download,
  MoreHorizontal
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
import type { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";

interface AdminUser {
  id: number;
  displayName: string;
  email: string;
  phone?: string;
  address?: string;
  role: "admin" | "user" | string;
  createdAt?: string;
  canManage: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const normalizeUser = (user: Partial<User> & Record<string, any>, index: number): AdminUser => {
    const rawId =
      user.userId ??
      user.user_id ??
      user.id ??
      Number(user.userID) ??
      Number(user.id);
    const id = typeof rawId === "number" && !Number.isNaN(rawId) && rawId > 0 ? rawId : index + 1;

    const roleNameRaw =
      user.role?.roleName ??
      user.role?.role_name ??
      user.roleName ??
      user.role_name;

    const roleId = user.roleId ?? user.role_id;

    const inferredRole =
      (roleNameRaw?.toLowerCase() as AdminUser["role"]) ??
      (roleId === 1 ? "admin" : undefined) ??
      (user.email && user.email.toLowerCase().includes("admin") ? "admin" : undefined) ??
      "user";

    return {
      id,
      displayName:
        user.username ||
        user.fullName ||
        user.name ||
        user.email ||
        `User #${id}`,
      email: user.email || "",
      phone: user.phone || user.phoneNumber || "",
      address: user.address || "",
      role: inferredRole,
      createdAt: user.createdAt || user.created_at || user.createdDate,
      canManage: Boolean(rawId && rawId > 0),
    };
  };

  // Load users từ API thật
  useEffect(() => {
    let ignore = false;
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const response = await userService.getAllUsers();
        if (ignore) return;
        const normalized = (response || []).map((user, index) => normalizeUser(user, index));
        setUsers(normalized);
        setFilteredUsers(normalized);
      } catch (error: any) {
        if (ignore) return;
        console.error("Error loading users:", error);
        toast({
          title: "Không thể tải người dùng",
          description: error?.message || "Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadUsers();
    return () => {
      ignore = true;
    };
  }, [toast]);

  // Filter users
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter((user) =>
        user.displayName.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        (user.phone && user.phone.includes(searchTerm)) ||
        (user.address && user.address.toLowerCase().includes(keyword))
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const handleDeleteUser = async (user: AdminUser) => {
    if (!user.canManage) {
      toast({
        title: "Không thể xóa người dùng",
        description: "Backend chưa cung cấp ID để thao tác xóa trên user này.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn xóa user này?")) return;
    try {
      await userService.deleteUser(user.id);
      setUsers(prev => prev.filter(item => item.id !== user.id));
      setFilteredUsers(prev => prev.filter(item => item.id !== user.id));
      toast({
        title: "Đã xóa user",
        description: `User #${user.id} đã được xóa khỏi hệ thống.`,
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

  const handleExportUsers = () => {
    const csvContent = [
      ['ID', 'Tên hiển thị', 'Email', 'Số điện thoại', 'Địa chỉ', 'Vai trò', 'Ngày tạo'],
      ...filteredUsers.map(user => [
        user.id,
        user.displayName,
        user.email,
        user.phone || '',
        user.address || '',
        user.role === 'admin' ? 'Quản trị viên' : 'Người dùng',
        user.createdAt ? formatDateTime(user.createdAt) : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === "admin" ? "destructive" : "outline"}>
        {role === "admin" ? "Quản trị viên" : "Người dùng"}
      </Badge>
    );
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
          <h1 className="text-2xl font-bold">Quản lý Người dùng</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả tài khoản người dùng trong hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Xuất CSV
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm User
          </Button>
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
            <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quản trị viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'user').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Có số điện thoại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {users.filter(u => !!u.phone).length}
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
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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
                <SelectItem value="admin">Quản trị viên</SelectItem>
                <SelectItem value="user">Người dùng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Người dùng ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Hiển thị {filteredUsers.length} trong tổng số {users.length} người dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy người dùng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={`${user.email || "user"}-${user.id}`}>
                      <TableCell className="font-mono text-sm">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.displayName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "—"}</TableCell>
                      <TableCell>{user.address || "—"}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.createdAt ? formatDateTime(user.createdAt) : "—"}
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
                            <DropdownMenuItem onClick={() => toast({ title: "Chưa hỗ trợ", description: "Tính năng đang được phát triển." })}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast({ title: "Chưa hỗ trợ", description: "Bạn sẽ sớm chỉnh sửa được user này." })}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user)}
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
    </div>
  );
};

export default UserManagement;
