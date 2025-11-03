import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CartPage = () => {
  const { cart, removeFromCart, clearCart } = useCart();

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
        <Link to="/" className="text-blue-500 hover:underline">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Giỏ hàng của bạn</h2>
      <table className="w-full border-collapse border border-border">
        <thead>
          <tr>
            <th className="border border-border p-2 text-left">Sản phẩm</th>
            <th className="border border-border p-2">Giá</th>
            <th className="border border-border p-2">Số lượng</th>
            <th className="border border-border p-2">Thành tiền</th>
            <th className="border border-border p-2">Xóa</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.id}>
              <td className="border border-border p-2">{item.name}</td>
              <td className="border border-border p-2">{item.price.toLocaleString()}₫</td>
              <td className="border border-border p-2">{item.quantity}</td>
              <td className="border border-border p-2">{(item.price * item.quantity).toLocaleString()}₫</td>
              <td className="border border-border p-2">
                <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-xl font-bold">Tổng: {totalPrice.toLocaleString()}₫</div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={clearCart}>Xóa tất cả</Button>
          <Button variant="default" onClick={() => alert("Thanh toán chưa triển khai")}>Thanh toán</Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
