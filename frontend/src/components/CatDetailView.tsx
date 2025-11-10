import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Product } from "@/types";
import { productService } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ShoppingCart, Heart } from "lucide-react";
import axios from "axios";
import PublicReview from "./PublicReview";

interface CatDetail {
  catId: number;
  breed: string;
  age: number;
  gender: string;
  vaccinated: boolean;
}

const CatDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [catDetail, setCatDetail] = useState<CatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProductAndCatDetail = async () => {
      if (!id) {
        console.log("No ID provided");
        return;
      }
      
      console.log("Loading product with ID:", id);
      
      try {
        setLoading(true);
        // Load product info
        const productData = await productService.getProductById(Number(id));
        console.log("Product data received:", productData);
        setProduct(productData);

        // Load cat detail if product type is cat (typeId = 1)
        if (productData.typeId === 1) {
          try {
            console.log("Loading cat details for ID:", id);
            const response = await axios.get(`http://localhost:8080/api/cat-details/${id}`);
            console.log("Cat details received:", response.data);
            setCatDetail(response.data);
          } catch (error) {
            console.error("Error loading cat details:", error);
          }
        }
      } catch (error) {
        console.error("Error loading product:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin sản phẩm",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProductAndCatDetail();
  }, [id, toast]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stockQuantity || 0)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    try {
      await axios.post("http://localhost:8080/api/cart/add", {
        productId: product?.productId,
        quantity: quantity,
      });

      toast({
        title: "Thành công",
        description: `Đã thêm ${quantity} ${product?.productName} vào giỏ hàng`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm vào giỏ hàng",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Get stock unit based on product type
  const getStockUnit = () => {
    if (!product) return "sản phẩm";
    
    // Chỉ mèo (typeId = 1) là "con", tất cả loại khác là "sản phẩm"
    return product.typeId === 1 ? "con" : "sản phẩm";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  const isInStock = product.stockQuantity > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden border border-border">
            <img
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.productName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.productName}</h1>
            <p className="text-3xl font-bold text-primary mb-4">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Cat Details */}
          {catDetail && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-lg mb-3">Thông tin chi tiết</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Giống</p>
                  <p className="font-medium">{catDetail.breed}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tuổi</p>
                  <p className="font-medium">{catDetail.age} tháng</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giới tính</p>
                  <p className="font-medium">{catDetail.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tiêm phòng</p>
                  <p className="font-medium">
                    {catDetail.vaccinated ? "✅ Đã tiêm" : "❌ Chưa tiêm"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Mô tả</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          {/* Stock Status */}
          <div>
            <p className="text-sm text-muted-foreground">
              Tình trạng:{" "}
              <span className={isInStock ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {isInStock ? `Còn ${product.stockQuantity} ${getStockUnit()}` : "Hết hàng"}
              </span>
            </p>
          </div>

          {/* Quantity and Add to Cart */}
          {isInStock && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Số lượng:</label>
                <Input
                  type="number"
                  min="1"
                  max={product.stockQuantity}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-24"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Thêm vào giỏ hàng
                </Button>
                <Button size="lg" variant="outline">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container mx-auto px-4 mt-12">
        <h2 className="text-2xl font-bold mb-6">Đánh giá sản phẩm</h2>
        <PublicReview />
      </div>
    </div>
  );
};

export default CatDetailView;
