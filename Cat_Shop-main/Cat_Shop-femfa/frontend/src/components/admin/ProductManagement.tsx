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
  Package,
  Download,
  MoreHorizontal,
  Image as ImageIcon
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
import { productService, categoryService } from "@/services/productService";
import type { Product, ProductType, Category } from "@/types";
import { formatCurrencyVND } from "@/lib/utils";

interface AdminProduct {
  id: number;
  name: string;
  typeId?: number;
  typeName?: string;
  categoryId?: number;
  categoryName?: string;
  price: number;
  stockQuantity: number;
  description?: string;
}

const TYPE_LABELS: Record<number, string> = {
  1: "Mèo cảnh",
  2: "Thức ăn",
  3: "Lồng chuồng",
  4: "Vệ sinh",
};

const ProductManagement = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<AdminProduct[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  const normalizeProduct = (
    product: Partial<Product> & Record<string, any>,
    categoryLookup: Map<number, string>
  ): AdminProduct => {
    const productId =
      product.productId ??
      product.product_id ??
      product.id ??
      0;
    const typeId =
      product.typeId ??
      product.type_id ??
      product.type?.typeId ??
      product.type?.type_id;
    const categoryId =
      product.categoryId ??
      product.category_id ??
      product.category?.categoryId ??
      product.category?.category_id;

    return {
      id: productId,
      name: product.productName ?? product.product_name ?? product.name ?? `Sản phẩm #${productId}`,
      typeId: typeId ? Number(typeId) : undefined,
      typeName:
        product.typeName ??
        product.type_name ??
        product.type?.typeName ??
        (typeId ? TYPE_LABELS[Number(typeId)] : undefined) ??
        "Không xác định",
      categoryId: categoryId ? Number(categoryId) : undefined,
      categoryName:
        product.categoryName ??
        product.category_name ??
        product.category?.categoryName ??
        categoryLookup.get(Number(categoryId)) ??
        "Chưa phân loại",
      price: Number(product.price ?? 0),
      stockQuantity: Number(product.stockQuantity ?? product.stock_quantity ?? 0),
      description: product.description || "",
    };
  };

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [categoriesResponse, productsResponse] = await Promise.all([
          categoryService.getAllCategoriesAdmin().catch(() => []),
          productService.getAllProductsCustomer(),
        ]);

        if (ignore) return;

        const categoryLookup = new Map<number, string>(
          (categoriesResponse || []).map((category) => [
            (category as any).categoryId ?? (category as any).category_id ?? (category as any).id,
            (category as any).categoryName ?? (category as any).category_name ?? "Danh mục",
          ])
        );

        const normalizedProducts = (productsResponse || []).map((product) =>
          normalizeProduct(product, categoryLookup)
        );

        const derivedTypes: ProductType[] = Array.from(
          new Map(
            normalizedProducts
              .filter((product) => product.typeId)
              .map((product) => [product.typeId!, product.typeName || TYPE_LABELS[product.typeId!] || "Không xác định"])
          )
        ).map(([typeId, typeName]) => ({
          typeId,
          typeName,
        }));

        setProductTypes(derivedTypes);
        setCategories(categoriesResponse || []);
        setProducts(normalizedProducts);
        setFilteredProducts(normalizedProducts);
      } catch (error: any) {
        if (ignore) return;
        console.error("Error loading products:", error);
        toast({
          title: "Không thể tải sản phẩm",
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

  // Filter products
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.description?.toLowerCase().includes(keyword) ||
        product.typeName?.toLowerCase().includes(keyword) ||
        product.categoryName?.toLowerCase().includes(keyword)
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((product) => product.typeId?.toString() === typeFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.categoryId?.toString() === categoryFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, typeFilter, categoryFilter]);

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      return;
    }
    try {
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      setFilteredProducts((prev) => prev.filter((product) => product.id !== productId));
      toast({
        title: "Đã xóa sản phẩm",
        description: `Sản phẩm #${productId} đã được xóa.`,
      });
    } catch (error: any) {
      console.error("Delete product error:", error);
      toast({
        title: "Xóa sản phẩm thất bại",
        description: error?.message || "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (product: AdminProduct) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Hết hàng</Badge>;
    }
    if (quantity < 10) {
      return <Badge variant="secondary">Sắp hết</Badge>;
    }
    return <Badge variant="default">Còn hàng</Badge>;
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
          <h1 className="text-2xl font-bold">Quản lý Sản phẩm</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả sản phẩm trong hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất CSV
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mèo cảnh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {products.filter(p => p.typeId === 1).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Thức ăn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.typeId === 2).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Phụ kiện</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {products.filter(p => p.typeId === 3 || p.typeId === 4).length}
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
                  placeholder="Tìm kiếm sản phẩm..."
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
                {productTypes.map((type) => {
                  const typeId = type.typeId ?? type.type_id;
                  const typeName = type.typeName ?? type.type_name;
                  if (typeId == null) {
                    return null;
                  }
                  return (
                    <SelectItem key={`type-${typeId}`} value={typeId.toString()}>
                      {typeName || TYPE_LABELS[typeId] || "Không xác định"}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Lọc theo danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => {
                  const categoryId = category.categoryId ?? category.category_id;
                  const categoryName = category.categoryName ?? category.category_name;
                  if (categoryId == null) {
                    return null;
                  }
                  return (
                    <SelectItem key={`category-${categoryId}`} value={categoryId.toString()}>
                      {categoryName || "Không có tên"}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sản phẩm ({filteredProducts.length})</CardTitle>
          <CardDescription>
            Hiển thị {filteredProducts.length} trong tổng số {products.length} sản phẩm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy sản phẩm nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product, index) => {
                    const rowKey =
                      product.id && product.id !== 0
                        ? `product-${product.id}`
                        : `product-index-${index}`;
                    return (
                      <TableRow key={rowKey}>
                      <TableCell className="font-mono text-sm">{product.id}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.typeName}</Badge>
                      </TableCell>
                      <TableCell>{product.categoryName}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrencyVND(product.price)}
                      </TableCell>
                      <TableCell>{product.stockQuantity}</TableCell>
                      <TableCell>{getStockBadge(product.stockQuantity)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(product)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => product.id && handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Product Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết sản phẩm</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về sản phẩm
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tên sản phẩm</label>
                  <p className="text-lg font-semibold">{selectedProduct.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">ID</label>
                  <p className="font-mono">{selectedProduct.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Loại</label>
                  <p>{selectedProduct.typeName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Danh mục</label>
                  <p>{selectedProduct.categoryName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Giá</label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrencyVND(selectedProduct.price)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tồn kho</label>
                  <p>{selectedProduct.stockQuantity}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Mô tả</label>
                <p className="text-muted-foreground">{selectedProduct.description || "—"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
