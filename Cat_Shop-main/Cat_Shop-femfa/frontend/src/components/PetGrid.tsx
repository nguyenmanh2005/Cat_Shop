import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductCard from "./ProductCard";
import Breadcrumb from "./Breadcrumb";
import { useProductTypes, useCategories } from "@/hooks/useApi";
import { Product, ProductType, Category } from "@/types/index";
import { productService } from "@/services/productService"; // 🆕 import trực tiếp service
import { getCategoryDisplayName } from "@/utils/categoryMapping"; // 🔧 Import mapping utility
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { loadFavoriteIds, saveFavoriteIds } from "@/utils/favorites";

const PetGrid = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState("default");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => loadFavoriteIds());

  //  Lấy loại sản phẩm & danh mục
  const { productTypes, loading: typesLoading } = useProductTypes();
  const { categories, loading: categoriesLoading } = useCategories();
  const { addItem } = useCart();
  const { toast } = useToast();

  //  Lấy danh sách sản phẩm public (không cần đăng nhập)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        if (!isAuthenticated) {
          setProducts([]);
          return;
        }
        const data = await productService.getAllProductsCustomer();
        console.log("✅ PetGrid: Nhận được sản phẩm từ API:", data?.length || 0);
        setProducts(data || []);
      } catch (error) {
        console.error("❌ PetGrid: Lỗi tải sản phẩm:", error);
        setProducts([]); // Đảm bảo products luôn là array
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isAuthenticated]);

  useEffect(() => {
    saveFavoriteIds(favoriteIds);
  }, [favoriteIds]);

  const breadcrumbItems = [
    { label: "TRANG CHỦ", href: "/" },
    { label: "SẢN PHẨM" },
  ];

  // 🧠 Lọc & sắp xếp khi dữ liệu thay đổi
  useEffect(() => {
    try {
      filterAndSortProducts();
    } catch (error) {
      console.error("Lỗi khi lọc sản phẩm:", error);
      setFilteredProducts([]);
    }
  }, [products, sortBy, selectedType, selectedCategory]);

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Lọc theo loại
    if (selectedType !== "all") {
      filtered = filtered.filter(
        (p) => p.typeId === parseInt(selectedType)
      );
    }

    // Lọc theo danh mục
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (p) => p.categoryId === parseInt(selectedCategory)
      );
    }

    // Sắp xếp
    switch (sortBy) {
      case "price-low-high":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-a-z":
        filtered.sort((a, b) =>
          a.productName.localeCompare(b.productName)
        );
        break;
      case "name-z-a":
        filtered.sort((a, b) =>
          b.productName.localeCompare(a.productName)
        );
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleViewDetails = (product: Product) => {
    if (!product?.productId) return;
    navigate(`/product/${product.productId}`);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${product.productName} đã được thêm vào giỏ.`,
    });
  };

  const handleToggleFavorite = (product: Product) => {
    if (!product?.productId) return;
    setFavoriteIds((prev) => {
      const exists = prev.includes(product.productId);
      const updated = exists
        ? prev.filter((id) => id !== product.productId)
        : [...prev, product.productId];

      toast({
        title: exists ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích",
        description: product.productName,
      });

      return updated;
    });
  };

  const totalLoading = loading || typesLoading || categoriesLoading;

  if (totalLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Đang tải...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-muted-foreground text-lg">
            Vui lòng đăng nhập để xem sản phẩm.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">SẢN PHẨM</h1>

          <div className="flex gap-4">
            {/* Lọc theo loại sản phẩm */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chọn loại sản phẩm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all-types" value="all">Tất cả loại</SelectItem>
                {productTypes && productTypes.length > 0 ? (
                  productTypes.map((type) => (
                    <SelectItem
                      key={`type-${type.typeId}`}
                      value={String(type.typeId)}
                    >
                      {type.typeName || 'Không có tên'}
                    </SelectItem>
                  ))
                ) : null}
              </SelectContent>
            </Select>

            {/* Lọc theo danh mục */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all-categories" value="all">Tất cả danh mục</SelectItem>
                {categories && categories.length > 0 ? (
                  categories
                    .filter((category) => category.categoryId != null) // Filter out undefined categoryId
                    .map((category) => (
                      <SelectItem
                        key={`category-${category.categoryId}`}
                        value={String(category.categoryId)}
                      >
                        {getCategoryDisplayName(category.categoryName || 'Không có tên')}
                      </SelectItem>
                    ))
                ) : null}
              </SelectContent>
            </Select>

            {/* Sắp xếp */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="sort-default" value="default">Mặc định</SelectItem>
                <SelectItem key="sort-price-low" value="price-low-high">
                  Giá: Thấp đến cao
                </SelectItem>
                <SelectItem key="sort-price-high" value="price-high-low">
                  Giá: Cao đến thấp
                </SelectItem>
                <SelectItem key="sort-name-az" value="name-a-z">Tên: A đến Z</SelectItem>
                <SelectItem key="sort-name-za" value="name-z-a">Tên: Z đến A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
                onViewDetails={() => handleViewDetails(product)}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favoriteIds.includes(product.productId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Không tìm thấy sản phẩm nào
            </p>
            {loading && <p className="text-sm text-muted-foreground mt-2">Đang tải...</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetGrid;
