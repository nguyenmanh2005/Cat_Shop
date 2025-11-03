import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Giỏ hàng của bạn</h1>
      {cart.length === 0 ? (
        <p>Giỏ hàng trống. <Link to="/pets" className="text-primary underline">Quay lại mua sắm</Link></p>
      ) : (
        <>
          <table className="w-full mb-6">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-2">Sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Tổng</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.id} className="border-b border-border">
                  <td className="py-2 flex items-center gap-3">
                    {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded"/>}
                    {item.name}
                  </td>
                  <td>{item.price.toLocaleString()}₫</td>
                  <td>
                    <input
                      type="number"
                      value={item.quantity}
                      min={1}
                      className="w-16 border px-2 py-1 rounded"
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    />
                  </td>
                  <td>{(item.price * item.quantity).toLocaleString()}₫</td>
                  <td>
                    <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>Xóa</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={clearCart}>Xóa toàn bộ</Button>
            <div className="text-lg font-bold">
              Tổng tiền: {total.toLocaleString()}₫
            </div>
          </div>

          <div className="mt-6 text-right">
            <Button size="lg" onClick={() => alert("Thanh toán giả lập! Thực hiện tích hợp Stripe/PayPal sau.")}>
              Thanh toán
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
