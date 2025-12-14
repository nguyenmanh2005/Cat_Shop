import { Search, Phone, Facebook, Instagram, Twitter, Youtube, Mail, User, ChevronDown, ShoppingCart } from "lucide-react";
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
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCategories } from "@/hooks/useApi";
import { getCategoryDisplayName } from "@/utils/categoryMapping"; // 🔧 Import mapping utility

const Header = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [searchTerm, setSearchTerm] = useState("");
  const { categories, loading: categoriesLoading } = useCategories();

  const handleOpenLogin = () => {
    setAuthMode("login");
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthMode("register");
    setIsAuthModalOpen(true);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to pets page with search query
      navigate(`/pets?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(""); // Clear search after navigating
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-md bg-background/95 shadow-sm transition-all duration-300">
      {/* Top bar with contact info */}
      <div className="bg-muted/30 border-b border-border animate-fade-in-down">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer group">
                <Phone className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-muted-foreground group-hover:text-primary transition-colors">0911.079.086</span>
              </div>
              <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer group">
                <Mail className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-muted-foreground group-hover:text-primary transition-colors">info@champets.com</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-all hover:scale-110 transform duration-300">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-all hover:scale-110 transform duration-300">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-all hover:scale-110 transform duration-300">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-all hover:scale-110 transform duration-300">
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
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all duration-300 hover:scale-105 group">
            <img src={logo} alt="Cham Pets" className="h-12 w-auto transition-transform duration-300 group-hover:rotate-3" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary group-hover:text-primary/80 transition-colors">Cham Pets</span>
              <span className="text-xs text-muted-foreground">Care - Love</span>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <div className="relative group">
              <Input
                type="text"
                placeholder="Search..."
                className="pr-10 bg-muted/30 border-border focus:bg-background focus:border-primary transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                variant="ghost"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Cart and Auth buttons or Profile menu */}
          <div className="flex items-center gap-2">
            {/* Cart Icon */}
            <Link to="/cart">
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-primary/10 transition-all duration-300 hover:scale-110"
              >
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-bounce"
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
                  Login
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleOpenRegister}
                  className="hidden sm:flex"
                >
                  Register
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
      <nav className="bg-primary animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-8">
            <Link to="/" className="py-3 px-4 text-primary-foreground font-medium hover:bg-primary-light/20 transition-all duration-300 relative group">
              HOME
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-foreground group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            {/* PETS dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="py-3 px-4 text-primary-foreground font-medium hover:bg-primary-light/20 transition-all duration-300 flex items-center gap-1 group">
                  PETS
                  <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-64 max-h-96 overflow-y-auto bg-white shadow-xl border border-border animate-scale-in"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                {categoriesLoading ? (
                  <div className="p-4 text-sm text-muted-foreground">Loading...</div>
                ) : categories.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No categories</div>
                ) : (
                  categories.map((category, index) => (
                    <DropdownMenuItem key={`category-item-${category.categoryId}`} asChild>
                      <Link
                        to={`/pets?category=${category.categoryId}`}
                        className="cursor-pointer px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-all duration-300 block w-full animate-fade-in-left"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {getCategoryDisplayName(category.categoryName)}
                      </Link>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/about" className="py-3 px-4 text-primary-foreground font-medium hover:bg-primary-light/20 transition-all duration-300 relative group">
              ABOUT
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-foreground group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/blog" className="py-3 px-4 text-primary-foreground font-medium hover:bg-primary-light/20 transition-all duration-300 relative group">
              BLOG
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-foreground group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/pets" className="py-3 px-4 text-primary-foreground font-medium hover:bg-primary-light/20 transition-all duration-300 relative group">
              PET PRODUCTS
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-foreground group-hover:w-full transition-all duration-300"></span>
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