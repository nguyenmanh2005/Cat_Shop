import { Product } from "@/types";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const navigate = useNavigate();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to product detail page
      navigate(`/product/${product.productId}`);
    }
  };

  return (
    <div 
      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={handleClick}
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
        
        <p className="text-sm text-muted-foreground mt-1">Còn lại: {product.stockQuantity} sản phẩm</p>
        
        <p className="text-lg font-bold text-primary mt-2">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
};

export default ProductCard;



