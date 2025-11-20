import { Search, Phone, Facebook, Instagram, Twitter, Youtube, Mail, User, ChevronDown, ShoppingCart, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";
import AuthModal from "./AuthModal";
import ProfileMenu from "./ProfileMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useApi";
import { getCategoryDisplayName } from "@/utils/categoryMapping"; // 🔧 Import mapping utility

const Header = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { getTotalItems } = useCart();
  const { tSync } = useLanguage();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { categories, loading: categoriesLoading } = useCategories();

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
      {/* Top bar with contact info */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">0911.079.086</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">info@champets.com</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
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
              <span className="text-xs text-muted-foreground">{tSync("header.slogan")}</span>
            </div>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Input
                type="text"
                placeholder={tSync("header.search.placeholder")}
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

          {/* Cart, Settings and Auth buttons or Profile menu */}
          <div className="flex items-center gap-2">
            {/* Settings Icon */}
            <Link to="/settings">
              <Button
                variant="ghost"
                size="sm"
                title={tSync("common.settings")}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </Link>

            {/* Cart Icon */}
            <Link to="/cart">
              <Button
                variant="ghost"
                size="sm"
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </Link>

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
                  {tSync("common.login")}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleOpenRegister}
                  className="hidden sm:flex"
                >
                  {tSync("common.register")}
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
              {tSync("nav.home").toUpperCase()}
            </Link>
            
            {/* THÚ CƯNG dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="py-3 px-4 text-primary-foreground font-medium hover:bg-primary-light/20 transition-colors flex items-center gap-1">
                  {tSync("nav.pets").toUpperCase()}
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-64 max-h-96 overflow-y-auto bg-white"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                {categoriesLoading ? (
                  <div className="p-4 text-sm text-muted-foreground">{tSync("common.loading")}</div>
                ) : categories.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">Không có danh mục</div>
                ) : (
                  categories.map((category) => (
                    <DropdownMenuItem key={`category-item-${category.categoryId}`} asChild>
                      <Link
                        to={`/pets?category=${category.categoryId}`}
                        className="cursor-pointer px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors block w-full"
                      >
                        {getCategoryDisplayName(category.categoryName)}
                      </Link>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/about" className="py-3 px-4 text-primary-foreground font-medium hover:bg-primary-light/20 transition-colors">
              {tSync("nav.about").toUpperCase()}
            </Link>
            <Link to="/blog" className="py-3 px-4 text-primary-foreground font-medium hover:bg-primary-light/20 transition-colors">
              {tSync("nav.blog").toUpperCase()}
            </Link>
            <Link to="/pets" className="py-3 px-4 text-primary-foreground font-medium hover:bg-primary-light/20 transition-colors">
              {tSync("nav.pet.products").toUpperCase()}
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