import { Product, CatDetail, FoodDetail, CageDetail, CleaningDetail } from "@/types";

interface ProductCardProps {
  product: Product & { 
    catDetail?: CatDetail;
    foodDetail?: FoodDetail;
    cageDetail?: CageDetail;
    cleaningDetail?: CleaningDetail;
  };
  onClick?: () => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderProductDetails = () => {
    switch (product.type?.type_name) {
      case 'Cat':
        return product.catDetail && (
          <>
            {product.catDetail.breed && (
              <p className="text-sm text-muted-foreground mb-1">Giống: {product.catDetail.breed}</p>
            )}
            {product.catDetail.age !== undefined && (
              <p className="text-sm text-muted-foreground mb-1">Tuổi: {product.catDetail.age} tháng</p>
            )}
            {product.catDetail.gender && (
              <p className="text-sm text-muted-foreground mb-1">Giới tính: {product.catDetail.gender}</p>
            )}
            {product.catDetail.vaccinated !== undefined && (
              <p className="text-sm text-muted-foreground mb-1">
                Tiêm phòng: {product.catDetail.vaccinated ? "✅ Đã tiêm" : "❌ Chưa tiêm"}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">Còn lại: {product.stock_quantity} con</p>
          </>
        );
      
      case 'Food':
        return product.foodDetail && (
          <>
            {product.foodDetail.weight_kg && (
              <p className="text-sm text-muted-foreground mb-1">Trọng lượng: {product.foodDetail.weight_kg}kg</p>
            )}
            {product.foodDetail.expiry_date && (
              <p className="text-sm text-muted-foreground mb-1">
                HSD: {new Date(product.foodDetail.expiry_date).toLocaleDateString('vi-VN')}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">Còn lại: {product.stock_quantity} sản phẩm</p>
          </>
        );
      
      case 'Cage':
        return product.cageDetail && (
          <>
            {product.cageDetail.material && (
              <p className="text-sm text-muted-foreground mb-1">Chất liệu: {product.cageDetail.material}</p>
            )}
            {product.cageDetail.dimensions && (
              <p className="text-sm text-muted-foreground mb-1">Kích thước: {product.cageDetail.dimensions}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">Còn lại: {product.stock_quantity} sản phẩm</p>
          </>
        );
      
      case 'Cleaning':
        return product.cleaningDetail && (
          <>
            {product.cleaningDetail.volume_ml && (
              <p className="text-sm text-muted-foreground mb-1">Dung tích: {product.cleaningDetail.volume_ml}ml</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">Còn lại: {product.stock_quantity} sản phẩm</p>
          </>
        );
      
      case 'Toy':
        return (
          <p className="text-sm text-muted-foreground mt-1">Còn lại: {product.stock_quantity} sản phẩm</p>
        );
      
      default:
        return (
          <p className="text-sm text-muted-foreground mt-1">Còn lại: {product.stock_quantity} sản phẩm</p>
        );
    }
  };

  return (
    <div 
      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden">
        <img 
          src={product.image_url || "/placeholder.svg"} 
          alt={product.product_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-foreground">{product.product_name}</h3>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
            {product.type?.type_name}
          </span>
        </div>
        
        {product.category?.category_name && (
          <p className="text-sm text-muted-foreground mb-2">{product.category.category_name}</p>
        )}
        
        {renderProductDetails()}
        
        <p className="text-lg font-bold text-primary mt-2">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
};

export default ProductCard;



