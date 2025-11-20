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
import { useToast } from "@/hooks/use-toast";
import { categoryService, productService } from "@/services/productService";
import type { Category, ProductType, Product } from "@/types";

interface AdminCategory {
  id: number;
  name: string;
  description?: string;
  typeId?: number;
  typeName?: string;
  productCount: number;
}

const TYPE_LABELS: Record<number, string> = {
  1: "Mèo cảnh",
  2: "Thức ăn",
  3: "Lồng chuồng",
  4: "Vệ sinh",
};

const CategoryManagement = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<AdminCategory[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const normalizeCategory = (
    category: Partial<Category> & Record<string, any>,
    productStats: Map<number, number>
  ): AdminCategory => {
    const categoryId =
      category.categoryId ??
      category.category_id ??
      category.id ??
      0;
    const typeId =
      category.typeId ??
      category.type_id ??
      category.type?.typeId ??
      category.type?.type_id;

    return {
      id: categoryId,
      name: category.categoryName ?? category.category_name ?? `Danh mục #${categoryId}`,
      description: category.description ?? "",
      typeId: typeId ? Number(typeId) : undefined,
      typeName:
        category.type?.typeName ??
        category.type_name ??
        (typeId ? TYPE_LABELS[Number(typeId)] : undefined) ??
        "Không xác định",
      productCount: productStats.get(categoryId) ?? 0,
    };
  };

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [categoriesResponse, productsResponse] = await Promise.all([
          categoryService.getAllCategoriesAdmin(),
          productService.getAllProductsCustomer().catch(() => []),
        ]);

        if (ignore) return;

        const productStats = new Map<number, number>();
        (productsResponse || []).forEach((product: Partial<Product> & Record<string, any>) => {
          const rawId =
            product.categoryId ??
            product.category_id ??
            product.category?.categoryId ??
            product.category?.category_id;
          const categoryId = rawId ? Number(rawId) : undefined;
          if (!categoryId) return;
          const current = productStats.get(categoryId) ?? 0;
          productStats.set(categoryId, current + 1);
        });

        const normalizedCategories = (categoriesResponse || []).map((category) =>
          normalizeCategory(category, productStats)
        );

        const derivedTypes: ProductType[] = Array.from(
          new Map(
            normalizedCategories
              .filter((category) => category.typeId)
              .map((category) => [
                category.typeId!,
                category.typeName || TYPE_LABELS[category.typeId!] || "Không xác định",
              ])
          )
        ).map(([typeId, typeName]) => ({
          typeId,
          typeName,
        }));

        setProductTypes(derivedTypes);
        setCategories(normalizedCategories);
        setFilteredCategories(normalizedCategories);
      } catch (error: any) {
        if (ignore) return;
        console.error("Error loading categories:", error);
        toast({
          title: "Không thể tải danh mục",
          description: error?.message || "Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      ignore = true;
    };
  }, [toast]);

  // Filter categories
  useEffect(() => {
    let filtered = categories;

    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter((category) =>
        category.name.toLowerCase().includes(keyword) ||
        category.description?.toLowerCase().includes(keyword) ||
        category.typeName?.toLowerCase().includes(keyword)
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((category) => category.typeId?.toString() === typeFilter);
    }

    setFilteredCategories(filtered);
  }, [categories, searchTerm, typeFilter]);

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      await categoryService.deleteCategory(categoryId);
      setCategories((prev) => prev.filter((category) => category.id !== categoryId));
      setFilteredCategories((prev) => prev.filter((category) => category.id !== categoryId));
      toast({
        title: "Đã xóa danh mục",
        description: `Danh mục #${categoryId} đã được xóa.`,
      });
    } catch (error: any) {
      console.error("Delete category error:", error);
      toast({
        title: "Xóa danh mục thất bại",
        description: error?.message || "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const handleExportCategories = () => {
    const csvContent = [
      ["ID", "Tên danh mục", "Loại sản phẩm", "Mô tả", "Số sản phẩm"],
      ...filteredCategories.map((category) => [
        category.id,
        category.name,
        category.typeName,
        category.description,
        category.productCount,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `categories_${new Date().toISOString().split("T")[0]}.csv`;
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
                      {productTypes.map((type) => (
                        <SelectItem key={type.typeId} value={type.typeId.toString()}>
                          {type.typeName}
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
              {categories.filter(c => c.typeId === 1).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Thức ăn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {categories.filter(c => c.typeId === 2).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Phụ kiện</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {categories.filter(c => c.typeId === 3 || c.typeId === 4).length}
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
                {productTypes.map((type) => (
                  <SelectItem key={type.typeId} value={type.typeId.toString()}>
                    {type.typeName}
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
                    <TableRow key={category.id}>
                      <TableCell className="font-mono text-sm">{category.id}</TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.typeName}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category.productCount} sản phẩm</Badge>
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
                              onClick={() => handleDeleteCategory(category.id)}
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
