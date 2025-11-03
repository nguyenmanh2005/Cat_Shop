// 📂 src/pages/TransactionsPage.tsx
import { Link } from "react-router-dom";

const TransactionsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Quản lý giao dịch & đơn hàng
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          to="/orders"
          className="px-6 py-4 bg-white rounded-2xl shadow hover:shadow-lg text-center border border-gray-200 hover:bg-gray-100 transition"
        >
          🧾 Quản lý Đơn hàng
        </Link>

        <Link
          to="/payments"
          className="px-6 py-4 bg-white rounded-2xl shadow hover:shadow-lg text-center border border-gray-200 hover:bg-gray-100 transition"
        >
          💳 Quản lý Thanh toán
        </Link>

        <Link
          to="/shipments"
          className="px-6 py-4 bg-white rounded-2xl shadow hover:shadow-lg text-center border border-gray-200 hover:bg-gray-100 transition"
        >
          🚚 Quản lý Vận chuyển
        </Link>
      </div>
    </div>
  );
};

export default TransactionsPage;
