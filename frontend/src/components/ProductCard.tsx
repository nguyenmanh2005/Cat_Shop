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
    // typeId = 1: Mèo → "con"
    // Các loại khác → "sản phẩm"
    return product.typeId === 1 ? "con" : "sản phẩm";
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
      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="aspect-square overflow-hidden">
        <img 
          src={product.imageUrl || "/placeholder.svg"} 
          alt={product.productName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-foreground">{product.productName}</h3>
          {product.typeName && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              {product.typeName}
            </span>
          )}
        </div>
        
        {product.categoryName && (
          <p className="text-sm text-muted-foreground mb-2">{product.categoryName}</p>
        )}
        
        <p className="text-sm text-muted-foreground mt-1">Còn lại: {product.stockQuantity} {getStockUnit()}</p>
        
        <p className="text-lg font-bold text-primary mt-2">{formatPrice(product.price)}</p>

        {showActions && (
          <div className="mt-4 flex items-center gap-2">
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails();
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Xem
              </Button>
            )}
            {onAddToCart && (
              <Button
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Giỏ hàng
              </Button>
            )}
            {onToggleFavorite && (
              <Button
                variant={isFavorite ? "default" : "ghost"}
                size="icon"
                className={cn(
                  "rounded-full",
                  isFavorite ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(product);
                }}
              >
                <Heart
                  className="h-4 w-4"
                  fill={isFavorite ? "currentColor" : "none"}
                />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;



