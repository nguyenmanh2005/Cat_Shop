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
  Edit, 
  Trash2, 
  Folder,
  Download,
  MoreHorizontal,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductType {
  type_id: number;
  type_name: string;
}

interface Category {
  category_id: number;
  category_name: string;
  description: string;
  type_id: number;
  type_name?: string;
  product_count?: number;
}

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Load mock data
  useEffect(() => {
    const loadData = () => {
      try {
        // Mock Product Types
        const mockTypes: ProductType[] = [
          { type_id: 1, type_name: "Mèo cảnh" },
          { type_id: 2, type_name: "Thức ăn" },
          { type_id: 3, type_name: "Lồng chuồng" },
          { type_id: 4, type_name: "Vệ sinh" }
        ];

        // Mock Categories
        const mockCategories: Category[] = [
          { 
            category_id: 1, 
            category_name: "Mèo thuần chủng", 
            description: "Các giống mèo thuần chủng, khỏe mạnh, đã tiêm phòng", 
            type_id: 1,
            type_name: "Mèo cảnh",
            product_count: 12
          },
          { 
            category_id: 2, 
            category_name: "Mèo lai", 
            description: "Các giống mèo lai, giá cả phải chăng", 
            type_id: 1,
            type_name: "Mèo cảnh",
            product_count: 8
          },
          { 
            category_id: 3, 
            category_name: "Thức ăn khô", 
            description: "Thức ăn khô cho mèo các độ tuổi", 
            type_id: 2,
            type_name: "Thức ăn",
            product_count: 25
          },
          { 
            category_id: 4, 
            category_name: "Thức ăn ướt", 
            description: "Thức ăn ướt, pate cho mèo", 
            type_id: 2,
            type_name: "Thức ăn",
            product_count: 18
          },
          { 
            category_id: 5, 
            category_name: "Lồng vận chuyển", 
            description: "Lồng để vận chuyển mèo an toàn", 
            type_id: 3,
            type_name: "Lồng chuồng",
            product_count: 6
          },
          { 
            category_id: 6, 
            category_name: "Lồng chơi", 
            description: "Lồng để mèo vui chơi, nghỉ ngơi", 
            type_id: 3,
            type_name: "Lồng chuồng",
            product_count: 4
          },
          { 
            category_id: 7, 
            category_name: "Cát vệ sinh", 
            description: "Cát vệ sinh khử mùi cho mèo", 
            type_id: 4,
            type_name: "Vệ sinh",
            product_count: 15
          },
          { 
            category_id: 8, 
            category_name: "Khay vệ sinh", 
            description: "Khay đựng cát vệ sinh", 
            type_id: 4,
            type_name: "Vệ sinh",
            product_count: 9
          }
        ];

        setProductTypes(mockTypes);
        setCategories(mockCategories);
        setFilteredCategories(mockCategories);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter categories
  useEffect(() => {
    let filtered = categories;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.type_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(category => category.type_id.toString() === typeFilter);
    }

    setFilteredCategories(filtered);
  }, [categories, searchTerm, typeFilter]);

  const handleDeleteCategory = (categoryId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      const updatedCategories = categories.filter(category => category.category_id !== categoryId);
      setCategories(updatedCategories);
    }
  };

  const handleExportCategories = () => {
    const csvContent = [
      ['ID', 'Tên danh mục', 'Loại sản phẩm', 'Mô tả', 'Số sản phẩm'],
      ...filteredCategories.map(category => [
        category.category_id,
        category.category_name,
        category.type_name,
        category.description,
        category.product_count
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `categories_${new Date().toISOString().split('T')[0]}.csv`;
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
          <h1 className="text-2xl font-bold">Quản lý Danh mục</h1>
          <p className="text-muted-foreground">
            Quản lý các danh mục sản phẩm trong hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCategories}>
            <Download className="h-4 w-4 mr-2" />
            Xuất CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm danh mục
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm danh mục mới</DialogTitle>
                <DialogDescription>
                  Tạo danh mục sản phẩm mới trong hệ thống
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tên danh mục</label>
                  <Input placeholder="Nhập tên danh mục..." />
                </div>
                <div>
                  <label className="text-sm font-medium">Loại sản phẩm</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map(type => (
                        <SelectItem key={type.type_id} value={type.type_id.toString()}>
                          {type.type_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Mô tả</label>
                  <Input placeholder="Nhập mô tả danh mục..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(false)}>
                    Thêm danh mục
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
            <CardTitle className="text-sm font-medium">Tổng danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mèo cảnh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {categories.filter(c => c.type_id === 1).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Thức ăn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {categories.filter(c => c.type_id === 2).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Phụ kiện</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {categories.filter(c => c.type_id === 3 || c.type_id === 4).length}
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
                  placeholder="Tìm kiếm danh mục..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Lọc theo loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {productTypes.map(type => (
                  <SelectItem key={type.type_id} value={type.type_id.toString()}>
                    {type.type_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh mục ({filteredCategories.length})</CardTitle>
          <CardDescription>
            Hiển thị {filteredCategories.length} trong tổng số {categories.length} danh mục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Loại sản phẩm</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Số sản phẩm</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy danh mục nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.category_id}>
                      <TableCell className="font-mono text-sm">{category.category_id}</TableCell>
                      <TableCell className="font-medium">{category.category_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.type_name}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category.product_count} sản phẩm</Badge>
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
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Folder className="mr-2 h-4 w-4" />
                              Xem sản phẩm
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteCategory(category.category_id)}
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

export default CategoryManagement;
