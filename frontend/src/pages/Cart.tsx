import React from "react";
import { getCartItems, removeFromCart, updateCartQuantity } from "@/utils/cartUtils";

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = React.useState(getCartItems());

  const handleRemove = (id: number) => {
    removeFromCart(id);
    setCartItems(getCartItems());
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    updateCartQuantity(id, quantity);
    setCartItems(getCartItems());
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">🛒 Giỏ hàng của bạn</h2>

      {cartItems.length === 0 ? (
        <p>Giỏ hàng trống.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b pb-2"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.image_url || "/placeholder.svg"}
                  alt={item.product_name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{item.product_name}</h3>
                  <p className="text-sm text-gray-500">
                    {item.price.toLocaleString("vi-VN")} ₫
                  </p>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.id, Number(e.target.value))
                    }
                    className="border rounded w-16 mt-1 px-1"
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                </p>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-500 hover:underline text-sm"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}

          <div className="text-right mt-6">
            <p className="text-lg font-bold">
              Tổng cộng: {totalPrice.toLocaleString("vi-VN")} ₫
            </p>
            <button className="mt-3 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Thanh toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
