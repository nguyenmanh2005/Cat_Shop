import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Giỏ hàng - Cham Pets";
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId);
      toast({
        title: "Đã xóa",
        description: "Sản phẩm đã được xóa khỏi giỏ hàng",
      });
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán",
        variant: "destructive",
      });
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col overflow-x-hidden page-transition">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="text-center space-y-4 animate-fade-in-up">
            <div className="animate-bounce">
              <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
            </p>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <Button onClick={() => navigate("/")} className="mt-4 hover-lift">
                Tiếp tục mua sắm
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden page-transition">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 animate-fade-in-down">Giỏ hàng của bạn</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <Card 
                key={item.product.productId}
                className="card-hover animate-fade-in-up gpu-accelerated"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-border flex-shrink-0 group">
                      <img
                        src={item.product.imageUrl || "/placeholder.svg"}
                        alt={item.product.productName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {item.product.productName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.product.categoryName || item.product.typeName}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            removeItem(item.product.productId);
                            toast({
                              title: "Đã xóa",
                              description: `${item.product.productName} đã được xóa khỏi giỏ hàng`,
                            });
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleQuantityChange(
                                item.product.productId,
                                item.quantity - 1
                              )
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max={item.product.stockQuantity}
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.product.productId,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-16 text-center"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleQuantityChange(
                                item.product.productId,
                                item.quantity + 1
                              )
                            }
                            disabled={item.quantity >= item.product.stockQuantity}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {formatPrice(item.product.price)} / sản phẩm
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 animate-fade-in-right card-hover">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Số lượng sản phẩm:</span>
                    <span>{getTotalItems()}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Tổng cộng:</span>
                      <span className="text-primary">
                        {formatPrice(getTotalPrice())}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleCheckout}
                >
                  Thanh toán
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  Tiếp tục mua sắm
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;

