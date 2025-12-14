import { Product, CatDetail } from "@/types";

interface PetCardProps {
  product: Product & { catDetail?: CatDetail };
  onClick?: () => void;
}

const PetCard = ({ product, onClick }: PetCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div 
      className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer group hover-lift animate-fade-in-up relative gpu-accelerated"
      onClick={onClick}
      style={{ animationDelay: '0ms' }}
    >
      {/* Image Container */}
      <div className="aspect-square overflow-hidden relative">
        <img 
          src={product.imageUrl || "/placeholder.svg"} 
          alt={product.productName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badge - Top Left */}
        {product.catDetail?.vaccinated && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm shadow-lg flex items-center gap-1">
              <span>✓</span> Đã tiêm phòng
            </span>
          </div>
        )}

        {/* Price Badge - Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-lg">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
          {product.productName}
        </h3>
        
        <div className="space-y-1.5">
          {product.catDetail?.breed && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Giống:</span>
              <span className="font-medium text-foreground">{product.catDetail.breed}</span>
            </div>
          )}
          {product.catDetail?.age !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Tuổi:</span>
              <span className="font-medium text-foreground">{product.catDetail.age} tháng</span>
            </div>
          )}
          {product.catDetail?.gender && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Giới tính:</span>
              <span className="font-medium text-foreground">{product.catDetail.gender}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Còn lại: <span className="font-semibold text-foreground">{product.stockQuantity}</span> con
          </p>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            Mèo cảnh
          </span>
        </div>
      </div>
    </div>
  );
};

export default PetCard;