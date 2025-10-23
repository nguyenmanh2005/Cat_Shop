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
  Image as ImageIcon,
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
}

interface Product {
  product_id: number;
  product_name: string;
  type_id: number;
  category_id?: number;
  price: number;
  stock_quantity: number;
  description: string;
  image_url?: string;
  type_name?: string;
  category_name?: string;
}

interface CatDetail {
  cat_id: number;
  breed: string;
  age: number;
  gender: string;
  vaccinated: boolean;
}

interface FoodDetail {
  food_id: number;
  weight_kg: number;
  ingredients: string;
  expiry_date: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
          { category_id: 1, category_name: "Mèo thuần chủng", description: "Các giống mèo thuần chủng", type_id: 1 },
          { category_id: 2, category_name: "Thức ăn khô", description: "Thức ăn khô cho mèo", type_id: 2 },
          { category_id: 3, category_name: "Lồng vận chuyển", description: "Lồng để vận chuyển mèo", type_id: 3 },
          { category_id: 4, category_name: "Cát vệ sinh", description: "Cát vệ sinh cho mèo", type_id: 4 }
        ];

        // Mock Products
        const mockProducts: Product[] = [
          {
            product_id: 1,
            product_name: "Mèo Bengal",
            type_id: 1,
            category_id: 1,
            price: 15000000,
            stock_quantity: 5,
            description: "Mèo Bengal thuần chủng, khỏe mạnh, đã tiêm phòng",
            type_name: "Mèo cảnh",
            category_name: "Mèo thuần chủng"
          },
          {
            product_id: 2,
            product_name: "Royal Canin Adult",
            type_id: 2,
            category_id: 2,
            price: 450000,
            stock_quantity: 50,
            description: "Thức ăn khô cho mèo trưởng thành",
            type_name: "Thức ăn",
            category_name: "Thức ăn khô"
          },
          {
            product_id: 3,
            product_name: "Lồng vận chuyển nhựa",
            type_id: 3,
            category_id: 3,
            price: 350000,
            stock_quantity: 20,
            description: "Lồng vận chuyển an toàn cho mèo",
            type_name: "Lồng chuồng",
            category_name: "Lồng vận chuyển"
          },
          {
            product_id: 4,
            product_name: "Cát vệ sinh Ever Clean",
            type_id: 4,
            category_id: 4,
            price: 120000,
            stock_quantity: 100,
            description: "Cát vệ sinh khử mùi tốt",
            type_name: "Vệ sinh",
            category_name: "Cát vệ sinh"
          },
          {
            product_id: 5,
            product_name: "Mèo Persian",
            type_id: 1,
            category_id: 1,
            price: 8000000,
            stock_quantity: 3,
            description: "Mèo Persian lông dài, hiền lành",
            type_name: "Mèo cảnh",
            category_name: "Mèo thuần chủng"
          }
        ];

        setProductTypes(mockTypes);
        setCategories(mockCategories);
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter products
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(product => product.type_id.toString() === typeFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(product => product.category_id?.toString() === categoryFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, typeFilter, categoryFilter]);

  const handleDeleteProduct = (productId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      const updatedProducts = products.filter(product => product.product_id !== productId);
      setProducts(updatedProducts);
    }
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Hết hàng</Badge>;
    } else if (quantity < 10) {
      return <Badge variant="secondary">Sắp hết</Badge>;
    } else {
      return <Badge variant="default">Còn hàng</Badge>;
    }
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
              {products.filter(p => p.type_id === 1).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Thức ăn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.type_id === 2).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Phụ kiện</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {products.filter(p => p.type_id === 3 || p.type_id === 4).length}
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
                {productTypes.map(type => (
                  <SelectItem key={type.type_id} value={type.type_id.toString()}>
                    {type.type_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Lọc theo danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.category_id} value={category.category_id.toString()}>
                    {category.category_name}
                  </SelectItem>
                ))}
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
                  filteredProducts.map((product) => (
                    <TableRow key={product.product_id}>
                      <TableCell className="font-mono text-sm">{product.product_id}</TableCell>
                      <TableCell className="font-medium">{product.product_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.type_name}</Badge>
                      </TableCell>
                      <TableCell>{product.category_name}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell>{product.stock_quantity}</TableCell>
                      <TableCell>{getStockBadge(product.stock_quantity)}</TableCell>
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
                              onClick={() => handleDeleteProduct(product.product_id)}
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
                  <p className="text-lg font-semibold">{selectedProduct.product_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">ID</label>
                  <p className="font-mono">{selectedProduct.product_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Loại</label>
                  <p>{selectedProduct.type_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Danh mục</label>
                  <p>{selectedProduct.category_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Giá</label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(selectedProduct.price)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tồn kho</label>
                  <p>{selectedProduct.stock_quantity}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Mô tả</label>
                <p className="text-muted-foreground">{selectedProduct.description}</p>
              </div>
              {selectedProduct.type_id === 1 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Thông tin mèo</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Giống: <span className="font-medium">Bengal</span></div>
                    <div>Tuổi: <span className="font-medium">3 tháng</span></div>
                    <div>Giới tính: <span className="font-medium">Đực</span></div>
                    <div>Đã tiêm phòng: <span className="font-medium">Có</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
