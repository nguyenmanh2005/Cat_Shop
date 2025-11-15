import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Pets from "./pages/Pets";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Security from "./pages/Security";
import LoginTest from "./pages/LoginTest";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import CatFood from "./pages/CatFood";
import Cattail from "./pages/Cattail";
import AdCate from "./pages/AdCate";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import QrLogin from "./pages/QrLogin";
import LoginSuccess from "./pages/LoginSuccess";
import OAuth2Success from "./pages/OAuth2Success";
import AuthFlowApp from "./authFlow/AuthFlowApp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/pets" element={<Pets />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cat-food" element={<CatFood />} />
              <Route path="/cattail" element={<Cattail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/security" element={<Security />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/categories" element={<AdCate />} />
              <Route path="/login-test" element={<LoginTest />} />
              <Route path="/qr-login" element={<QrLogin />} />
              <Route path="/login-success" element={<LoginSuccess />} />
              <Route path="/oauth2/success" element={<OAuth2Success />} />
              <Route path="/auth-flow/*" element={<AuthFlowApp />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
