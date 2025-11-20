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
      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden">
        <img 
          src={product.imageUrl || "/placeholder.svg"} 
          alt={product.productName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-foreground mb-2">{product.productName}</h3>
        {product.catDetail?.breed && (
          <p className="text-sm text-muted-foreground mb-1">Giống: {product.catDetail.breed}</p>
        )}
        {product.catDetail?.age !== undefined && (
          <p className="text-sm text-muted-foreground mb-1">Tuổi: {product.catDetail.age} tháng</p>
        )}
        {product.catDetail?.gender && (
          <p className="text-sm text-muted-foreground mb-1">Giới tính: {product.catDetail.gender}</p>
        )}
        {product.catDetail?.vaccinated !== undefined && (
          <p className="text-sm text-muted-foreground mb-1">
            Tiêm phòng: {product.catDetail.vaccinated ? "✅ Đã tiêm" : "❌ Chưa tiêm"}
          </p>
        )}
        <p className="text-lg font-bold text-primary mt-2">{formatPrice(product.price)}</p>
        <p className="text-sm text-muted-foreground mt-1">Còn lại: {product.stockQuantity} con</p>
      </div>
    </div>
  );
};

export default PetCard;