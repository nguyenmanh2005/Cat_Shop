import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Product } from "@/types";
import { productService } from "@/services/productService";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, ShoppingCart, Heart } from "lucide-react";
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
  const { addItem } = useCart();
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
            const response = await apiService.get(`/cat-details/${id}`);
            console.log("Cat details received:", response);
            setCatDetail(response);
          } catch (error) {
            console.error("Error loading cat details:", error);
          }
        }
      } catch (error) {
        console.error("Error loading product:", error);
        toast({
          title: "Error",
          description: "Unable to load product information",
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

  const handleAddToCart = () => {
    if (!product) return;

    if (quantity > product.stockQuantity) {
      toast({
        title: "Error",
        description: `Quantity exceeds stock. Only ${product.stockQuantity} ${getStockUnit()} available`,
        variant: "destructive",
      });
      return;
    }

    addItem(product, quantity);
    toast({
      title: "Success",
      description: `Added ${quantity} ${product.productName} to cart`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Get stock unit based on product type
  const getStockUnit = () => {
    if (!product) return "items";
    
    // Only cats (typeId = 1) are "units", all other types are "items"
    return product.typeId === 1 ? "units" : "items";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <div className="text-lg animate-pulse">Loading product...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <p className="text-muted-foreground text-lg">Product not found</p>
      </div>
    );
  }

  const isInStock = product.stockQuantity > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in page-transition">
      <Button
        variant="ghost"
        className="mb-6 hover-lift animate-fade-in-left"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4 animate-fade-in-right">
          <div className="aspect-square rounded-lg overflow-hidden border border-border group hover-lift">
            <img
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.productName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6 animate-fade-in-left" style={{ animationDelay: '0.2s' }}>
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.productName}</h1>
            <p className="text-3xl font-bold text-primary mb-4">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Cat Details */}
          {catDetail && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 card-hover animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="font-semibold text-lg mb-3">Details</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Breed", value: catDetail.breed },
                  { label: "Age", value: `${catDetail.age} months` },
                  { label: "Gender", value: catDetail.gender },
                  { label: "Vaccinated", value: catDetail.vaccinated ? "✅ Yes" : "❌ No" }
                ].map((info, index) => (
                  <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${0.4 + index * 0.1}s` }}>
                    <p className="text-sm text-muted-foreground">{info.label}</p>
                    <p className="font-medium">{info.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Stock Status */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <p className="text-sm text-muted-foreground">
              Status:{" "}
              <span className={`font-medium ${isInStock ? "text-blue-600" : "text-red-600"}`}>
                {isInStock ? `${product.stockQuantity} ${getStockUnit()} in stock` : "Out of stock"}
              </span>
            </p>
          </div>

          {/* Quantity and Add to Cart */}
          {isInStock && (
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Quantity:</label>
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
                  className="flex-1 hover-lift hover-glow"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline" className="hover-lift">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container mx-auto px-4 mt-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        <h2 className="text-2xl font-bold mb-6">Product Reviews</h2>
        {product && <PublicReview productId={product.productId} />}
      </div>
    </div>
  );
};

export default CatDetailView;
