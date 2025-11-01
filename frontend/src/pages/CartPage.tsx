import React, { useEffect, useState } from "react";
import axios from "axios";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Giả sử dữ liệu giỏ hàng lấy từ localStorage
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);
    const totalPrice = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
    setTotal(totalPrice);
  }, []);

  // 🧠 Hàm gọi API thanh toán
  const handleCheckout = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:8080/api/checkout", {
        items: cartItems,
        total: total,
      });

      setMessage(response.data.message || "Thanh toán thành công!");
      localStorage.removeItem("cart"); // Xóa giỏ hàng sau khi thanh toán
    } catch (error) {
      console.error(error);
      setMessage("Thanh toán thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">🛒 Giỏ hàng của bạn</h1>

      {cartItems.length === 0 ? (
        <p>Giỏ hàng trống.</p>
      ) : (
        <>
          <ul className="divide-y">
            {cartItems.map((item) => (
              <li key={item.id} className="flex justify-between py-3">
                <span>{item.name}</span>
                <span>
                  {item.quantity} × {item.price.toLocaleString()}₫
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 text-right font-semibold">
            Tổng cộng: {total.toLocaleString()}₫
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition"
          >
            {loading ? "Đang xử lý..." : "Thanh toán"}
          </button>
        </>
      )}

      {message && <p className="mt-4 text-center text-lg font-medium">{message}</p>}
    </div>
  );
};

export default CartPage;
