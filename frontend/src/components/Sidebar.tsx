import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { useProductTypes, useCategories } from "@/hooks/useApi";

const Sidebar = () => {
  const [openTypes, setOpenTypes] = useState<Record<number, boolean>>({});
  const { productTypes, loading: typesLoading } = useProductTypes();
  const { categories } = useCategories();

  const toggleType = (typeId: number) => {
    setOpenTypes(prev => ({ ...prev, [typeId]: !prev[typeId] }));
  };

  if (typesLoading) {
    return (
      <div className="w-72 bg-background border-r border-border">
        <div className="p-4">
          <div className="text-sm text-muted-foreground">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-background border-r border-border">
      <div className="p-4">
        <h2 className="text-lg font-bold text-foreground mb-4">DANH MỤC SẢN PHẨM</h2>
        
        {/* Product Types với Categories */}
        {productTypes.map((type) => {
          const typeCategories = categories.filter(cat => cat.typeId === type.typeId);
          const isOpen = openTypes[type.typeId] || false;
          
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
                    {typeCategories.map((category) => (
                      <Button
                        key={category.categoryId}
                        variant="ghost"
                        className="w-full justify-start text-left p-2 h-auto font-normal text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      >
                        {category.categoryName}
                      </Button>
                    ))}
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
