import { useState } from "react";
import { orderApi } from "@/api/orderApi";

const CheckoutPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    paymentMethod: "COD",
  });

  const [cartItems] = useState(() => {
    // Giả lập giỏ hàng — sau này lấy từ localStorage hoặc Redux
    return JSON.parse(localStorage.getItem("cart") || "[]");
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const orderData = {
      userId: 1, // tạm thời fix ID user
      totalAmount: cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      paymentMethod: formData.paymentMethod,
      shippingAddress: formData.address,
      items: cartItems.map((item: any) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      const res = await orderApi.createOrder(orderData);
      console.log("Order created:", res.data);
      alert("Đặt hàng thành công!");
      localStorage.removeItem("cart");
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      alert("Đặt hàng thất bại!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🛒 Thanh toán</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="fullName"
          placeholder="Họ và tên"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Số điện thoại"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Địa chỉ giao hàng"
          value={formData.address}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="COD">Thanh toán khi nhận hàng (COD)</option>
          <option value="BANK">Chuyển khoản ngân hàng</option>
          <option value="MOMO">Ví Momo</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Xác nhận thanh toán
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
