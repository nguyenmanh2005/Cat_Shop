import { useEffect, useState } from "react";
import orderApi from "@/api/orderApi";

interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getAll();
        setOrders(res.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="p-6">Đang tải danh sách đơn hàng...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách đơn hàng</h1>
      <table className="min-w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 border">Mã đơn</th>
            <th className="p-3 border">Người đặt</th>
            <th className="p-3 border">Tổng tiền</th>
            <th className="p-3 border">Trạng thái</th>
            <th className="p-3 border">Ngày tạo</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="p-3 border text-center">{order.id}</td>
              <td className="p-3 border text-center">{order.userId}</td>
              <td className="p-3 border text-center">{order.totalAmount}₫</td>
              <td className="p-3 border text-center">
                <span
                  className={`px-2 py-1 rounded text-white ${
                    order.status === "PENDING"
                      ? "bg-yellow-500"
                      : order.status === "COMPLETED"
                      ? "bg-green-600"
                      : "bg-gray-500"
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="p-3 border text-center">
                {new Date(order.createdAt).toLocaleDateString("vi-VN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersPage;
