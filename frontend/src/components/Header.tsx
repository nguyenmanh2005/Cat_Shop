import { Search, Phone, Facebook, Instagram, Twitter, Youtube, Mail, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import AuthModal from "./AuthModal";
import ProfileMenu from "./ProfileMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const handleOpenLogin = () => {
    setAuthMode("login");
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthMode("register");
    setIsAuthModalOpen(true);
  };

  return (
    <header className="bg-background border-b border-border">
      {/* Top bar with social and contact */}
      <div className="bg-muted/30 py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Chăm sóc - Yêu thương</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Facebook className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
              <Instagram className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
              <Twitter className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
              <Youtube className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
              <Mail className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-4 w-4 text-primary" />
              <span className="font-semibold">0911.079.086</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Cham Pets" className="h-12 w-auto" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">Cham Pets</span>
              <span className="text-xs text-muted-foreground">Chăm sóc - Yêu thương</span>
            </div>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm..."
                className="pr-10 bg-muted/30 border-border"
              />
              <Button
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                variant="ghost"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Auth buttons or Profile menu */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = "/admin"}
                    className="hidden sm:flex"
                  >
                    Admin Panel
                  </Button>
                )}
                <ProfileMenu />
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenLogin}
                  className="hidden sm:flex"
                >
                  <User className="h-4 w-4 mr-2" />
                  Đăng nhập
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleOpenRegister}
                  className="hidden sm:flex"
                >
                  Đăng ký
                </Button>
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenLogin}
                  className="sm:hidden"
                >
                  <User className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-primary">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-8">
            <Link to="/" className="py-3 px-4 text-primary-foreground font-medium hover:bg-primary-light/20 transition-colors">
              TRANG CHỦ
            </Link>
            <Link to="/about" className="py-3 px-4 text-primary-foreground font-medium hover:bg-primary-light/20 transition-colors">
              GIỚI THIỆU
            </Link>
            <Link to="/blog" className="py-3 px-4 text-primary-foreground font-medium hover:bg-primary-light/20 transition-colors">
              BLOG
            </Link>
            <Link to="/pets" className="py-3 px-4 text-primary-foreground font-medium hover:bg-primary-light/20 transition-colors">
              MÈO CẢNH
            </Link>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </header>
  );
};

export default Header;