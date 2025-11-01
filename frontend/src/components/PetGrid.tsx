import { useState, useEffect } from "react";
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
import { Product, ProductType, Category } from "@/types";
import { productService } from "@/services/productService"; // 🆕 import trực tiếp service

const PetGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState("default");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  //  Lấy loại sản phẩm & danh mục
  const { productTypes, loading: typesLoading } = useProductTypes();
  const { categories, loading: categoriesLoading } = useCategories();

  //  Lấy danh sách sản phẩm public (không cần đăng nhập)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAllProductsCustomer(); // 🆕 dùng API customer
        setProducts(data);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const breadcrumbItems = [
    { label: "TRANG CHỦ", href: "/" },
    { label: "SẢN PHẨM" },
  ];

  // 🧠 Lọc & sắp xếp khi dữ liệu thay đổi
  useEffect(() => {
    filterAndSortProducts();
  }, [products, sortBy, selectedType, selectedCategory]);

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Lọc theo loại
    if (selectedType !== "all") {
      filtered = filtered.filter(
        (p) => p.type_id === parseInt(selectedType)
      );
    }

    // Lọc theo danh mục
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (p) => p.category_id === parseInt(selectedCategory)
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
          a.product_name.localeCompare(b.product_name)
        );
        break;
      case "name-z-a":
        filtered.sort((a, b) =>
          b.product_name.localeCompare(a.product_name)
        );
        break;
    }

    setFilteredProducts(filtered);
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
                <SelectItem value="all">Tất cả loại</SelectItem>
                {productTypes.map((type) => (
                  <SelectItem
                    key={type.type_id}
                    value={type.type_id.toString()}
                  >
                    {type.type_name}
                  </SelectItem>
                ))}
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
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => (
                  <SelectItem
                    key={category.category_id}
                    value={category.category_id.toString()}
                  >
                    {category.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sắp xếp */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Mặc định</SelectItem>
                <SelectItem value="price-low-high">
                  Giá: Thấp đến cao
                </SelectItem>
                <SelectItem value="price-high-low">
                  Giá: Cao đến thấp
                </SelectItem>
                <SelectItem value="name-a-z">Tên: A đến Z</SelectItem>
                <SelectItem value="name-z-a">Tên: Z đến A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              onClick={() => {
                console.log("Clicked product:", product.product_name);
              }}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Không tìm thấy sản phẩm nào
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetGrid;
