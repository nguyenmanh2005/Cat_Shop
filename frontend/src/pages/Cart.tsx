import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Plus, Minus, ShoppingBag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrData, setQrData] = useState("");
  const [qrOrderId, setQrOrderId] = useState<number | null>(null);

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

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated || !user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để thanh toán",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    if (!user.id) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create order
      const totalPrice = getTotalPrice();
      if (totalPrice <= 0) {
        throw new Error("Tổng tiền phải lớn hơn 0");
      }

      // Ensure totalAmount is a valid number > 0
      const totalAmount = parseFloat(totalPrice.toFixed(2));
      if (isNaN(totalAmount) || totalAmount <= 0) {
        throw new Error(`Tổng tiền không hợp lệ: ${totalAmount}`);
      }

      const orderData = {
        userId: Number(user.id), // Ensure it's a number
        status: "PENDING",
        totalAmount: totalAmount, // Must be > 0
      };

      console.log("Creating order with data:", orderData);
      console.log("User:", user);
      console.log("Total price:", totalPrice, "Total amount:", totalAmount);

      const order = await apiService.post("/orders", orderData);
      const orderId = (order as any).order_id || (order as any).orderId;

      if (!orderId) {
        throw new Error("Order ID not found in response");
      }

      // Step 2: Create order details
      const orderDetailPromises = items.map((item) =>
        apiService.post("/order-details", {
          orderId: orderId,
          productId: item.product.productId,
          quantity: item.quantity,
          price: item.product.price,
        })
      );

      await Promise.all(orderDetailPromises);

      // Step 3: Generate VietQR code
      try {
        const qrResponse = await apiService.post<{
          qrCodeBase64: string;
          qrData: string;
          orderId: number;
          amount: number;
          accountNo: string;
          accountName: string;
          content: string;
          bankName: string;
          message: string;
        }>("/payments/generate-vietqr", {
          orderId: orderId,
          amount: getTotalPrice(),
          content: `Thanh toan don hang #${orderId}`,
        });

        // Store QR code data and order ID
        setQrData(qrResponse.qrCodeBase64);
        setQrOrderId(qrResponse.orderId);
        setShowQRDialog(true);
        setLoading(false);
      } catch (qrError: any) {
        console.error("Error generating VietQR:", qrError);
        toast({
          title: "Lỗi",
          description: qrError.response?.data?.message || "Không thể tạo mã QR thanh toán. Vui lòng thử lại.",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      
      let errorMessage = "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.data?.message) {
        errorMessage = error.response.data.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check for validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorList = Object.entries(validationErrors)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        errorMessage = `Lỗi validation:\n${errorList}`;
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!qrOrderId) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin đơn hàng",
        variant: "destructive",
      });
      return;
    }

    // Clear cart
    clearCart();

    toast({
      title: "Đặt hàng thành công!",
      description: "Đơn hàng của bạn đã được tạo thành công. Chúng tôi sẽ liên hệ với bạn sớm nhất.",
    });

    // Close dialog and redirect
    setShowQRDialog(false);
    navigate("/");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="text-center space-y-4">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">Giỏ hàng của bạn đang trống</h2>
            <p className="text-muted-foreground">
              Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
            </p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Tiếp tục mua sắm
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.product.productId}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-border flex-shrink-0">
                      <img
                        src={item.product.imageUrl || "/placeholder.svg"}
                        alt={item.product.productName}
                        className="w-full h-full object-cover"
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
                          className="text-destructive hover:text-destructive"
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
            <Card className="sticky top-4">
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
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Thanh toán"
                  )}
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

      {/* QR Code Payment Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thanh toán bằng QR Code</DialogTitle>
            <DialogDescription>
              Quét mã QR bằng ứng dụng ngân hàng của bạn để thanh toán
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
              {qrData && (
                <img
                  src={`data:image/png;base64,${qrData}`}
                  alt="VietQR Code"
                  className="w-64 h-64"
                />
              )}
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Số tiền: <span className="font-bold text-primary">{formatPrice(getTotalPrice())}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Sau khi thanh toán, vui lòng nhấn "Đã thanh toán" để hoàn tất đơn hàng
              </p>
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCompleteOrder}
              >
                Đã thanh toán
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setShowQRDialog(false);
                  navigate("/");
                }}
              >
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;

