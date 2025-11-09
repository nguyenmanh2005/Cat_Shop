import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface OrderItem {
  orderId: number;
  userId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy userId tạm thời
  const userId = Number(localStorage.getItem("userId") || 1);

  // Gọi API backend lấy "giỏ hàng" (các đơn hàng pending)
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/orders/user/${userId}`
        );
        // Lọc các đơn hàng pending (giả lập giỏ hàng)
        const pendingOrders = res.data.data.filter(
          (order: OrderItem) => order.status === "pending"
        );
        setCartItems(pendingOrders);
      } catch (err) {
        console.error("Lỗi tải giỏ hàng:", err);
        setError("Không thể tải giỏ hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [userId]);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.totalAmount,
    0
  );

  if (loading)
    return <div className="text-center mt-8">⏳ Đang tải dữ liệu...</div>;

  if (error)
    return (
      <div className="text-center text-red-500 mt-8">
        <p>{error}</p>
        <Link to="/" className="text-blue-500 hover:underline">
          Quay lại trang chủ
        </Link>
      </div>
    );

  if (cartItems.length === 0)
    return (
      <div className="text-center mt-8">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
        <Link to="/" className="text-blue-500 hover:underline">
          Quay lại trang chủ
        </Link>
      </div>
    );

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">🛒 Giỏ hàng của bạn</h2>

      <table className="w-full border-collapse border border-border">
        <thead>
          <tr>
            <th className="border border-border p-2 text-left">Mã đơn hàng</th>
            <th className="border border-border p-2">Ngày đặt</th>
            <th className="border border-border p-2">Tổng tiền</th>
            <th className="border border-border p-2">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <tr key={item.orderId}>
              <td className="border border-border p-2">{item.orderId}</td>
              <td className="border border-border p-2">
                {new Date(item.orderDate).toLocaleDateString()}
              </td>
              <td className="border border-border p-2">
                {item.totalAmount.toLocaleString()}₫
              </td>
              <td className="border border-border p-2 text-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    try {
                      await axios.delete(
                        `http://localhost:8080/api/orders/${item.orderId}`
                      );
                      setCartItems((prev) =>
                        prev.filter((i) => i.orderId !== item.orderId)
                      );
                    } catch (err) {
                      console.error("Xóa đơn hàng thất bại:", err);
                    }
                  }}
                >
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-xl font-bold">
          Tổng cộng: {totalPrice.toLocaleString()}₫
        </div>
        <div className="flex gap-3">
          <Button
            variant="destructive"
            onClick={async () => {
              for (const item of cartItems) {
                await axios.delete(
                  `http://localhost:8080/api/orders/${item.orderId}`
                );
              }
              setCartItems([]);
            }}
          >
            Xóa tất cả
          </Button>
          <Button
            variant="default"
            onClick={() => alert("Chức năng thanh toán đang được phát triển.")}
          >
            Thanh toán
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
