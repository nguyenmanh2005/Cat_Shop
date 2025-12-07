import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";
import { productService } from "@/services/productService";
import { Product } from "@/types";
import { loadFavoriteIds, saveFavoriteIds } from "@/utils/favorites";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const Favorites = () => {
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => loadFavoriteIds());
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    const fetchFavorites = async () => {
      if (favoriteIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const allProducts = await productService.getAllProductsCustomer();
        if (ignore) return;
        const filtered = (allProducts || []).filter((product) =>
          favoriteIds.includes(product.productId)
        );
        setProducts(filtered);
        setError(null);
      } catch (err: any) {
        if (ignore) return;
        setError(err?.message || "Không thể tải danh sách yêu thích.");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchFavorites();
    return () => {
      ignore = true;
    };
  }, [favoriteIds]);

  useEffect(() => {
    saveFavoriteIds(favoriteIds);
  }, [favoriteIds]);

  const breadcrumbItems = useMemo(
    () => [
      { label: "TRANG CHỦ", href: "/" },
      { label: "THÚ CƯNG YÊU THÍCH" },
    ],
    []
  );

  const handleRemoveFavorite = (productId: number) => {
    setFavoriteIds((prev) => {
      const updated = prev.filter((id) => id !== productId);
      toast({
        title: "Đã bỏ yêu thích",
        description: "Sản phẩm đã được xóa khỏi danh sách.",
      });
      return updated;
    });
    setProducts((prev) => prev.filter((product) => product.productId !== productId));
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${product.productName} đã được thêm vào giỏ.`,
    });
  };

  const handleViewDetails = (product: Product) => {
    navigate(`/product/${product.productId}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden page-transition">
      <Header />
      <main className="flex-1 p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />
          <div className="flex items-center justify-between mb-8 animate-fade-in-down">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Thú cưng yêu thích</h1>
              <p className="text-muted-foreground mt-2">
                Theo dõi các sản phẩm bạn đã đánh dấu trái tim để dễ dàng quay lại.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="text-lg text-muted-foreground animate-pulse">Đang tải danh sách yêu thích...</div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12 animate-fade-in">
              <p className="text-lg text-red-500 mb-4">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="animate-bounce mb-4">
                <Heart className="h-16 w-16 mx-auto text-muted-foreground" />
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                Bạn chưa có sản phẩm yêu thích nào.
              </p>
              <button
                className="text-primary underline hover:text-primary/80 transition-colors"
                onClick={() => navigate("/pets")}
              >
                Quay lại xem sản phẩm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div
                  key={product.productId}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard
                    product={product}
                    onViewDetails={() => handleViewDetails(product)}
                    onAddToCart={handleAddToCart}
                    onToggleFavorite={() => handleRemoveFavorite(product.productId)}
                    isFavorite
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;


