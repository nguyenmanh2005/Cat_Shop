import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  onViewDetails?: () => void;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  isFavorite?: boolean;
}

const ProductCard = ({ 
  product, 
  onClick, 
  onViewDetails, 
  onAddToCart, 
  onToggleFavorite,
  isFavorite = false
}: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStockUnit = () => {
    // typeId = 1: Cat → "units"
    // Other types → "items"
    return product.typeId === 1 ? "units" : "items";
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    onViewDetails?.();
  };

  const showActions = onViewDetails || onAddToCart || onToggleFavorite;

  return (
    <div 
      className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer group hover-lift animate-fade-in-up relative gpu-accelerated"
      onClick={handleCardClick}
      style={{ animationDelay: '0ms' }}
    >
      {/* Image Container with Overlay */}
      <div className="aspect-square overflow-hidden relative">
        <img 
          src={product.imageUrl || "/placeholder.svg"} 
          alt={product.productName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Favorite Button - Top Right */}
        {onToggleFavorite && (
          <div className="absolute top-3 right-3 z-10">
            <Button
              variant={isFavorite ? "default" : "ghost"}
              size="icon"
              className={cn(
                "rounded-full backdrop-blur-sm transition-all duration-300",
                isFavorite 
                  ? "bg-primary text-primary-foreground shadow-lg scale-100" 
                  : "bg-white/80 text-muted-foreground hover:bg-white hover:scale-110"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(product);
              }}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-all duration-300",
                  isFavorite && "animate-pulse"
                )}
                fill={isFavorite ? "currentColor" : "none"}
              />
            </Button>
          </div>
        )}

        {/* Quick Actions - Bottom Overlay (Show on Hover) */}
        {showActions && (
          <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-2">
              {onViewDetails && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 backdrop-blur-sm bg-white/90 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails();
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              )}
              {onAddToCart && (
                <Button
                  size="sm"
                  className="flex-1 bg-primary hover:bg-primary/90 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {product.productName}
          </h3>
          {product.typeName && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
              {product.typeName}
            </span>
          )}
        </div>
        
        {product.categoryName && (
          <p className="text-sm text-muted-foreground">{product.categoryName}</p>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
          <p className="text-xs text-muted-foreground">
            {product.stockQuantity} {getStockUnit()} in stock
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;



