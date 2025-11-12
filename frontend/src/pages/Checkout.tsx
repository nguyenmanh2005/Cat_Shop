import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { ArrowLeft, Loader2, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  note?: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "qr">("cod");
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrData, setQrData] = useState("");
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: "",
    note: "",
  });

  useEffect(() => {
    document.title = "Thanh toán - Cham Pets";
    
    if (!isAuthenticated) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để thanh toán",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán",
        variant: "destructive",
      });
      navigate("/cart");
      return;
    }
  }, [isAuthenticated, items.length, navigate, toast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleCompleteOrder = async () => {
    try {
      // Step 2: Create order details for each item
      // Get order ID from QR data
      const qrObj = JSON.parse(qrData);
      const orderId = qrObj.orderId;

      const orderDetailPromises = items.map((item) =>
        apiService.post("/order-details", {
          orderId: orderId,
          productId: item.product.productId,
          quantity: item.quantity,
          price: item.product.price,
        })
      );

      await Promise.all(orderDetailPromises);

      // Clear cart
      clearCart();

      toast({
        title: "Đặt hàng thành công!",
        description: "Đơn hàng của bạn đã được tạo thành công. Chúng tôi sẽ liên hệ với bạn sớm nhất.",
      });

      // Redirect to home
      navigate("/");
    } catch (error: any) {
      console.error("Complete order error:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi hoàn tất đơn hàng. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Lỗi",
        description: "Vui lòng đăng nhập để thanh toán",
        variant: "destructive",
      });
      return;
    }

    // Validate shipping info
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin giao hàng",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create order
      const orderData = {
        userId: user.id,
        status: "PENDING",
        totalAmount: Number(getTotalPrice().toFixed(2)),
      };

      const order = await apiService.post("/orders", orderData);
      
      // If QR payment, generate QR code
      if (paymentMethod === "qr") {
        const orderId = (order as any).order_id || (order as any).orderId;
        // Generate QR code data with order info
        const qrContent = JSON.stringify({
          orderId: orderId,
          amount: getTotalPrice(),
          merchant: "Cham Pets",
          account: "1234567890", // Bank account number
          content: `Thanh toan don hang #${orderId}`,
        });
        setQrData(qrContent);
        setShowQRDialog(true);
        setLoading(false);
        return; // Don't complete order yet, wait for QR payment confirmation
      }

      // Step 2: Create order details for each item
      // Handle both order_id (snake_case) and orderId (camelCase) from backend
      const orderId = (order as any).order_id || (order as any).orderId;
      if (!orderId) {
        throw new Error("Order ID not found in response");
      }

      const orderDetailPromises = items.map((item) =>
        apiService.post("/order-details", {
          orderId: orderId,
          productId: item.product.productId,
          quantity: item.quantity,
          price: item.product.price,
        })
      );

      await Promise.all(orderDetailPromises);

      // Clear cart
      clearCart();

      toast({
        title: "Đặt hàng thành công!",
        description: "Đơn hàng của bạn đã được tạo thành công. Chúng tôi sẽ liên hệ với bạn sớm nhất.",
      });

      // Redirect to home or order history
      navigate("/");
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message ||
          "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/cart")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại giỏ hàng
        </Button>

        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Shipping Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin giao hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Họ và tên *</Label>
                    <Input
                      id="fullName"
                      value={shippingInfo.fullName}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, fullName: e.target.value })
                      }
                      required
                      placeholder="Nhập họ và tên"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, phone: e.target.value })
                      }
                      required
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Địa chỉ giao hàng *</Label>
                    <Textarea
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, address: e.target.value })
                      }
                      required
                      placeholder="Nhập địa chỉ giao hàng"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                    <Textarea
                      id="note"
                      value={shippingInfo.note}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, note: e.target.value })
                      }
                      placeholder="Ghi chú thêm cho đơn hàng"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Sản phẩm đặt mua</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.product.productId}
                        className="flex gap-4 pb-4 border-b last:border-0"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                          <img
                            src={item.product.imageUrl || "/placeholder.svg"}
                            alt={item.product.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.productName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Số lượng: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                      <span className="text-muted-foreground">Phí vận chuyển:</span>
                      <span>Miễn phí</span>
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

                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Phương thức thanh toán</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="cod"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={(e) => setPaymentMethod(e.target.value as "cod" | "qr")}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="cod" className="font-normal cursor-pointer">
                          Thanh toán khi nhận hàng (COD)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="qr"
                          name="payment"
                          value="qr"
                          checked={paymentMethod === "qr"}
                          onChange={(e) => setPaymentMethod(e.target.value as "cod" | "qr")}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="qr" className="font-normal cursor-pointer flex items-center gap-2">
                          <QrCode className="h-4 w-4" />
                          Thanh toán bằng QR Code
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Đặt hàng"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
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
                <QRCodeSVG
                  value={qrData}
                  size={256}
                  level="H"
                  includeMargin={true}
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
                onClick={() => {
                  setShowQRDialog(false);
                  // Complete order after payment
                  handleCompleteOrder();
                }}
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

export default Checkout;

