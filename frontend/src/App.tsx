import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

// 🧩 Các trang chính
import Index from "@/pages/Index";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import Pets from "@/pages/Pets";
import Admin from "@/pages/Admin";
import LoginTest from "@/pages/LoginTest";
import NotFound from "@/pages/NotFound";

// 🛒 Trang giỏ hàng
import CartPage from "@/pages/cart/CartPage";

// 💼 Module đơn hàng & thanh toán
import OrdersPage from "@/pages/orders/OrdersPage";
import OrderDetailsPage from "@/pages/orders/OrderDetailsPage";
import PaymentsPage from "@/pages/orders/PaymentsPage";
import ShipmentsPage from "@/pages/orders/ShipmentsPage";

// 💼 Trang tổng hợp mới
import TransactionPage from "@/pages/TransactionPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* 🏠 Trang chính */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/pets" element={<Pets />} />

          {/* 🛒 Giỏ hàng */}
          <Route path="/cart" element={<CartPage />} />

          {/* 💼 Giao dịch & đơn hàng */}
          <Route path="/transactions" element={<TransactionPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/shipments" element={<ShipmentsPage />} />

          {/* 🛠️ Trang quản trị */}
          <Route path="/admin" element={<Admin />} />

          {/* 🔐 Trang đăng nhập / test auth */}
          <Route path="/login-test" element={<LoginTest />} />

          {/* 🚫 Trang không tồn tại */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
