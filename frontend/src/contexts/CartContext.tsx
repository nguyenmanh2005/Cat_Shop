import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/types";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "cat_shop_cart";

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [items]);

  const addItem = (product: Product, quantity: number) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.productId === product.productId
      );

      if (existingItem) {
        // Update quantity if item already exists
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stockQuantity) {
          toast({
            title: "Lỗi",
            description: `Số lượng vượt quá tồn kho. Chỉ còn ${product.stockQuantity} ${product.typeId === 1 ? "con" : "sản phẩm"}`,
            variant: "destructive",
          });
          return prevItems;
        }
        return prevItems.map((item) =>
          item.product.productId === product.productId
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // Add new item
        if (quantity > product.stockQuantity) {
          toast({
            title: "Lỗi",
            description: `Số lượng vượt quá tồn kho. Chỉ còn ${product.stockQuantity} ${product.typeId === 1 ? "con" : "sản phẩm"}`,
            variant: "destructive",
          });
          return prevItems;
        }
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const removeItem = (productId: number) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.product.productId !== productId)
    );
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prevItems) => {
      const item = prevItems.find((item) => item.product.productId === productId);
      if (item && quantity > item.product.stockQuantity) {
        toast({
          title: "Lỗi",
          description: `Số lượng vượt quá tồn kho. Chỉ còn ${item.product.stockQuantity} ${item.product.typeId === 1 ? "con" : "sản phẩm"}`,
          variant: "destructive",
        });
        return prevItems;
      }
      return prevItems.map((item) =>
        item.product.productId === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

