import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useProductTypes, useCategories } from "@/hooks/useApi";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openTypes, setOpenTypes] = useState<Record<number, boolean>>({});
  const { productTypes, loading: typesLoading } = useProductTypes();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  // Debug logs
  useEffect(() => {
    console.log("🔍 Sidebar - productTypes:", productTypes);
    console.log("🔍 Sidebar - categories:", categories);
    console.log("🔍 Sidebar - categoriesLoading:", categoriesLoading);
    console.log("🔍 Sidebar - categoriesError:", categoriesError);
  }, [productTypes, categories, categoriesLoading, categoriesError]);

  // Tự động mở type khi có category được chọn từ URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const selectedCategoryId = searchParams.get('category');
    
    if (selectedCategoryId) {
      // Tìm category được chọn
      const selectedCategory = categories.find(
        cat => String(cat.categoryId) === selectedCategoryId
      );
      
      // Nếu tìm thấy category, mở type tương ứng
      if (selectedCategory && selectedCategory.typeId) {
        setOpenTypes(prev => ({ ...prev, [selectedCategory.typeId!]: true }));
      }
    }
  }, [location.search, categories]);

  const toggleType = (typeId: number) => {
    setOpenTypes(prev => ({ ...prev, [typeId]: !prev[typeId] }));
  };

  if (typesLoading || categoriesLoading) {
    return (
      <div className="w-72 bg-background border-r border-border">
        <div className="p-4">
          <div className="text-sm text-muted-foreground">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="w-72 bg-background border-r border-border">
        <div className="p-4">
          <div className="text-sm text-red-500">Lỗi: {categoriesError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-background border-r border-border">
      <div className="p-4">
        <h2 className="text-lg font-bold text-foreground mb-4">DANH MỤC SẢN PHẨM</h2>
        
        {/* Product Types với Categories */}
        {productTypes.length === 0 && (
          <div className="text-sm text-muted-foreground">Không có loại sản phẩm</div>
        )}
        {productTypes.map((type) => {
          const typeCategories = categories.filter(cat => cat.typeId === type.typeId);
          const isOpen = openTypes[type.typeId] || false;
          console.log(`🔍 Type ${type.typeName} (${type.typeId}): ${typeCategories.length} categories`);
          
          return (
            <div key={type.typeId} className="mb-2">
              <Collapsible open={isOpen} onOpenChange={() => toggleType(type.typeId)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-left p-2 h-auto font-semibold hover:bg-accent"
                  >
                    {type.typeName}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                {typeCategories.length > 0 && (
                  <CollapsibleContent className="ml-4 mt-2 space-y-1">
                    {typeCategories.map((category) => {
                      // Kiểm tra xem category này có đang được chọn không (từ URL query param)
                      const searchParams = new URLSearchParams(location.search);
                      const selectedCategoryId = searchParams.get('category');
                      const isSelected = selectedCategoryId === String(category.categoryId);
                      
                      return (
                        <Button
                          key={category.categoryId}
                          variant="ghost"
                          className={`w-full justify-start text-left p-2 h-auto font-normal hover:text-foreground hover:bg-accent/50 ${
                            isSelected 
                              ? 'bg-accent text-foreground font-medium' 
                              : 'text-muted-foreground'
                          }`}
                          onClick={() => {
                            // Kiểm tra categoryId có tồn tại không
                            if (!category.categoryId) {
                              console.error("❌ Sidebar: category.categoryId là undefined:", category);
                              return;
                            }
                            
                            // Navigate đến trang pets với query param category
                            console.log("🖱️ Sidebar: Click vào category:", {
                              categoryId: category.categoryId,
                              categoryName: category.categoryName,
                              typeId: category.typeId,
                              fullCategory: category,
                              navigateTo: `/pets?category=${category.categoryId}`
                            });
                            navigate(`/pets?category=${category.categoryId}`);
                          }}
                        >
                          {category.categoryName}
                        </Button>
                      );
                    })}
                  </CollapsibleContent>
                )}
              </Collapsible>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
