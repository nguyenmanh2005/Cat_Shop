import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

const petBreeds = [
  "Mèo Bengal",
  "Mèo British Shorthair", 
  "Mèo Maine Coon",
  "Mèo Persian",
  "Mèo Ragdoll",
  "Mèo Scottish Fold",
  "Mèo Sphynx",
  "Mèo ta",
  "Mèo Abyssinian",
  "Mèo Siamese",
  "Mèo Russian Blue",
  "Mèo Norwegian Forest"
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-72 bg-background border-r border-border">
      <div className="p-4">
        <h2 className="text-lg font-bold text-foreground mb-4">DANH MỤC SẢN PHẨM</h2>
        
        {/* Other category */}
        <div className="mb-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-left p-2 h-auto font-normal text-muted-foreground hover:text-foreground"
          >
            Khác
          </Button>
        </div>

        {/* Pet breeds collapsible */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-left p-2 h-auto font-semibold hover:bg-accent"
            >
              Mèo cảnh
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-4 mt-2 space-y-1">
            {petBreeds.map((breed, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left p-2 h-auto font-normal text-muted-foreground hover:text-foreground hover:bg-accent/50"
              >
                {breed}
              </Button>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default Sidebar;
