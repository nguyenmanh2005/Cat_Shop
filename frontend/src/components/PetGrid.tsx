import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  const location = useLocation();
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

  //  Lấy danh sách sản phẩm - gọi API theo category hoặc type
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        if (!isAuthenticated) {
          setProducts([]);
          setFilteredProducts([]);
          return;
        }
        
        // Đọc lại query param trực tiếp từ URL để đảm bảo có giá trị mới nhất
        const searchParams = new URLSearchParams(location.search);
        const categoryParam = searchParams.get('category');
        const searchQuery = searchParams.get('search');
        const currentCategory = categoryParam && categoryParam !== "undefined" && categoryParam !== "null" 
          ? categoryParam 
          : "all";
        
        console.log("🔍 PetGrid fetchProducts:", {
          selectedCategory,
          selectedType,
          categoryParam,
          currentCategory,
          searchQuery,
          locationSearch: location.search
        });
        
        let data: Product[] = [];
        
        // Ưu tiên: Search > Category > Type > All
        // Nếu có search query, gọi API searchProducts
        if (searchQuery && searchQuery.trim()) {
          console.log("🔍 PetGrid: Đang tìm kiếm sản phẩm với từ khóa:", searchQuery);
          try {
            data = await productService.searchProducts(searchQuery.trim());
            console.log("✅ PetGrid: Nhận được kết quả tìm kiếm:", data?.length || 0, "products");
          } catch (error: any) {
            console.error("❌ PetGrid: Lỗi khi tìm kiếm sản phẩm:", {
              searchQuery,
              error: error.message,
              response: error.response?.data,
              status: error.response?.status
            });
            // Nếu search lỗi, fallback về lấy tất cả products
            data = await productService.getAllProductsCustomer();
          }
        }
        // Nếu có category được chọn, gọi API getProductsByCategory
        else if (currentCategory && currentCategory !== "all") {
          const categoryId = parseInt(currentCategory);
          if (isNaN(categoryId) || categoryId <= 0) {
            console.error("❌ PetGrid: categoryId không hợp lệ:", currentCategory);
            // Nếu categoryId không hợp lệ, fallback về lấy tất cả products
            data = await productService.getAllProductsCustomer();
            console.log("✅ PetGrid: Fallback - Nhận được tất cả sản phẩm:", data?.length || 0, "products");
          } else {
            console.log("🔍 PetGrid: Đang lấy sản phẩm theo category ID:", categoryId);
            try {
              data = await productService.getProductsByCategory(categoryId);
              console.log("✅ PetGrid: Nhận được sản phẩm từ API (by category):", data?.length || 0, "products");
              if (data && data.length > 0) {
                console.log("📦 PetGrid: Chi tiết products:", data.slice(0, 5).map(p => ({
                  id: p.productId,
                  name: p.productName,
                  categoryId: p.categoryId,
                  typeId: p.typeId
                })));
              } else {
                console.warn("⚠️ PetGrid: Không có sản phẩm nào cho category ID:", categoryId);
                data = [];
              }
            } catch (error: any) {
              console.error("❌ PetGrid: Lỗi khi gọi getProductsByCategory:", {
                categoryId,
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
              });
              // Nếu API lỗi, fallback về lấy tất cả products
              console.log("🔄 PetGrid: Fallback - Lấy tất cả sản phẩm do lỗi API");
              data = await productService.getAllProductsCustomer();
            }
          }
        } 
        // Nếu không có category nhưng có type được chọn, gọi API getProductsByType
        else if (selectedType && selectedType !== "all") {
          const typeId = parseInt(selectedType);
          if (isNaN(typeId) || typeId <= 0) {
            console.error("❌ PetGrid: typeId không hợp lệ:", selectedType);
            data = await productService.getAllProductsCustomer();
            console.log("✅ PetGrid: Fallback - Nhận được tất cả sản phẩm:", data?.length || 0, "products");
          } else {
            console.log("🔍 PetGrid: Đang lấy sản phẩm theo type ID:", typeId);
            try {
              data = await productService.getProductsByType(typeId);
              console.log("✅ PetGrid: Nhận được sản phẩm từ API (by type):", data?.length || 0, "products");
              if (data && data.length > 0) {
                console.log("📦 PetGrid: Chi tiết products:", data.slice(0, 5).map(p => ({
                  id: p.productId,
                  name: p.productName,
                  categoryId: p.categoryId,
                  typeId: p.typeId
                })));
              } else {
                console.warn("⚠️ PetGrid: Không có sản phẩm nào cho type ID:", typeId);
                data = [];
              }
            } catch (error: any) {
              console.error("❌ PetGrid: Lỗi khi gọi getProductsByType:", {
                typeId,
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
              });
              console.log("🔄 PetGrid: Fallback - Lấy tất cả sản phẩm do lỗi API");
              data = await productService.getAllProductsCustomer();
            }
          }
        } 
        // Nếu không có cả category và type, lấy tất cả sản phẩm
        else {
          data = await productService.getAllProductsCustomer();
          console.log("✅ PetGrid: Nhận được tất cả sản phẩm từ API:", data?.length || 0, "products");
        }
        
        const productsArray = data || [];
        console.log("📦 PetGrid: Set products state với", productsArray.length, "products");
        setProducts(productsArray);
        
        // Set filteredProducts ngay lập tức để đảm bảo hiển thị ngay
        // useEffect sẽ tự động gọi filterAndSortProducts() sau khi state update
        // Nhưng để đảm bảo không bị delay, set trực tiếp ở đây
        if (productsArray.length > 0) {
          setFilteredProducts(productsArray);
          console.log("✅ PetGrid: Set filteredProducts với", productsArray.length, "products");
        } else {
          setFilteredProducts([]);
        }
      } catch (error) {
        console.error("❌ PetGrid: Lỗi tải sản phẩm:", error);
        setProducts([]); // Đảm bảo products luôn là array
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isAuthenticated, location.search, selectedType]); // Thêm selectedType vào dependency

  useEffect(() => {
    saveFavoriteIds(favoriteIds);
  }, [favoriteIds]);

  // Đọc query param từ URL để set selectedCategory - CHẠY TRƯỚC KHI FETCH PRODUCTS
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    console.log("🔍 PetGrid: Đọc query param từ URL:", {
      locationSearch: location.search,
      categoryParam,
      willSetTo: categoryParam || "all"
    });
    if (categoryParam && categoryParam !== "undefined" && categoryParam !== "null") {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory("all");
    }
  }, [location.search]);

  const breadcrumbItems = [
    { label: "TRANG CHỦ", href: "/" },
    { label: "SẢN PHẨM" },
  ];

  // 🧠 Lọc & sắp xếp khi dữ liệu thay đổi
  useEffect(() => {
    try {
      console.log("🔄 PetGrid: useEffect filterAndSortProducts triggered", {
        productsLength: products.length,
        selectedType,
        selectedCategory,
        sortBy
      });
      
      // Nếu chưa có products, đừng filter
      if (products.length === 0) {
        console.log("⏸️ PetGrid: Chưa có products, bỏ qua filter");
        setFilteredProducts([]);
        return;
      }
      
      // Đọc lại category và search từ URL để đảm bảo sync
      const searchParams = new URLSearchParams(location.search);
      const categoryParam = searchParams.get('category');
      const searchQuery = searchParams.get('search');
      const currentCategory = categoryParam && categoryParam !== "undefined" && categoryParam !== "null" 
        ? categoryParam 
        : "all";
      
      // Cập nhật selectedCategory nếu khác
      if (currentCategory !== selectedCategory) {
        setSelectedCategory(currentCategory);
      }
      
      // Nếu có search query, không cần filter thêm (đã filter từ API)
      if (searchQuery && searchQuery.trim()) {
        // Products đã được filter từ search API, chỉ cần sort
        const sorted = [...products];
        switch (sortBy) {
          case "price-low-high":
            sorted.sort((a, b) => a.price - b.price);
            break;
          case "price-high-low":
            sorted.sort((a, b) => b.price - a.price);
            break;
          case "name-a-z":
            sorted.sort((a, b) => a.productName.localeCompare(b.productName));
            break;
          case "name-z-a":
            sorted.sort((a, b) => b.productName.localeCompare(a.productName));
            break;
        }
        setFilteredProducts(sorted);
        return;
      }
      
      filterAndSortProducts();
    } catch (error) {
      console.error("Lỗi khi lọc sản phẩm:", error);
      setFilteredProducts([]);
    }
  }, [products, sortBy, selectedType, selectedCategory, location.search]);

  const filterAndSortProducts = () => {
    // Đảm bảo products có dữ liệu
    if (!products || products.length === 0) {
      console.warn("⚠️ PetGrid: filterAndSortProducts được gọi nhưng products rỗng");
      setFilteredProducts([]);
      return;
    }
    
    let filtered = [...products];
    
    console.log("🔍 PetGrid filterAndSortProducts:", {
      totalProducts: products.length,
      selectedType,
      selectedCategory,
      productsSample: products.slice(0, 3).map(p => ({
        id: p.productId,
        name: p.productName,
        categoryId: p.categoryId,
        typeId: p.typeId
      }))
    });

    // Lọc theo loại (chỉ khi đã có products từ getAllProductsCustomer hoặc getProductsByCategory)
    // Nếu đã gọi getProductsByType, products đã được filter rồi, không cần filter lại
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    const hasCategoryFilter = categoryParam && categoryParam !== "undefined" && categoryParam !== "null";
    
    if (selectedType !== "all" && hasCategoryFilter) {
      // Nếu có cả category và type filter, cần filter theo type (vì category đã filter rồi)
      const typeId = parseInt(selectedType);
      if (!isNaN(typeId)) {
        const beforeFilter = filtered.length;
        filtered = filtered.filter((p) => p.typeId === typeId);
        console.log(`✅ Filtered by typeId ${typeId} (after category filter): ${beforeFilter} -> ${filtered.length} products`);
      }
    }

    // Lọc theo danh mục (chỉ khi đã có products từ getAllProductsCustomer hoặc getProductsByType)
    // Nếu đã gọi getProductsByCategory, products đã được filter rồi, không cần filter lại
    if (selectedCategory !== "all" && !hasCategoryFilter && selectedType === "all") {
      // Nếu chỉ filter theo category và chưa gọi API getProductsByCategory, filter local
      const categoryId = parseInt(selectedCategory);
      if (!isNaN(categoryId)) {
        const beforeFilter = filtered.length;
        filtered = filtered.filter((p) => p.categoryId === categoryId);
        console.log(`✅ Filtered by categoryId ${categoryId}: ${beforeFilter} -> ${filtered.length} products`);
      }
    } else if (selectedCategory !== "all" && !hasCategoryFilter && selectedType !== "all") {
      // Nếu có cả type và category filter, và đã gọi getProductsByType, cần filter theo category
      const categoryId = parseInt(selectedCategory);
      if (!isNaN(categoryId)) {
        const beforeFilter = filtered.length;
        filtered = filtered.filter((p) => p.categoryId === categoryId);
        console.log(`✅ Filtered by categoryId ${categoryId} (after type filter): ${beforeFilter} -> ${filtered.length} products`);
      }
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
          <div>
            <h1 className="text-2xl font-bold text-foreground">SẢN PHẨM</h1>
            {(() => {
              const searchParams = new URLSearchParams(location.search);
              const searchQuery = searchParams.get('search');
              if (searchQuery && searchQuery.trim()) {
                return (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Kết quả tìm kiếm cho: <strong className="text-foreground">"{searchQuery}"</strong>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/pets')}
                    >
                      Xóa bộ lọc
                    </Button>
                  </div>
                );
              }
              return null;
            })()}
            {(selectedCategory !== "all" || selectedType !== "all") && !location.search.includes('search=') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedType("all");
                  navigate("/pets");
                }}
                className="mt-2"
              >
                Xem tất cả
              </Button>
            )}
          </div>

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
