import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Package,
  Download,
  MoreHorizontal,
  Image as ImageIcon,
  Upload
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { productService, categoryService } from "@/services/productService";
import type { Product, ProductType, Category } from "@/types";
import { formatCurrencyVND } from "@/lib/utils";

interface AdminProduct {
  id: number;
  name: string;
  typeId?: number;
  typeName?: string;
  categoryId?: number;
  categoryName?: string;
  price: number;
  stockQuantity: number;
  description?: string;
  _originalData?: any; // Lưu data gốc từ backend để lấy ID khi cần
}

// Map typeName từ database (tiếng Anh) sang tiếng Việt để hiển thị
const TYPE_NAME_MAP: Record<string, string> = {
  "Cat": "Mèo cảnh",
  "Food": "Thức ăn",
  "Cage": "Lồng chuồng",
  "Cleaning": "Vệ sinh",
  "Toy": "Đồ chơi",
};

const ProductManagement = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<AdminProduct[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  // Lưu mapping từ unique key -> productId để dùng khi edit (vì backend không trả về productId)
  const [productIdMap, setProductIdMap] = useState<Map<string, number>>(new Map());
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    typeId: "",
    categoryId: "",
    price: "",
    stockQuantity: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const normalizeProduct = (
    product: Partial<Product> & Record<string, any>,
    categoryLookup: Map<number, string>
  ): AdminProduct => {
    // Tìm productId từ nhiều nguồn khác nhau
    const productId =
      product.productId ??
      product.product_id ??
      product.id ??
      product._originalData?.productId ??
      product._originalData?.product_id ??
      product._originalData?.id ??
      null;
    
    // Nếu không tìm thấy ID, log warning và throw error thay vì default về 0
    if (!productId || productId === 0) {
      console.warn("⚠️ ProductManagement: Không tìm thấy productId cho product:", {
        product,
        availableKeys: Object.keys(product),
        productId,
      });
    }
    const typeId =
      product.typeId ??
      product.type_id ??
      product.type?.typeId ??
      product.type?.type_id;
    const categoryId =
      product.categoryId ??
      product.category_id ??
      product.category?.categoryId ??
      product.category?.category_id;

    return {
      id: productId || 0, // Giữ 0 để hiển thị, nhưng sẽ validate khi update/delete
      name: product.productName ?? product.product_name ?? product.name ?? `Sản phẩm #${productId}`,
      typeId: typeId ? Number(typeId) : undefined,
      typeName: (() => {
        const rawTypeName = product.typeName ?? product.type_name ?? product.type?.typeName;
        if (rawTypeName) {
          // Nếu có typeName từ response, map sang tiếng Việt
          return TYPE_NAME_MAP[rawTypeName] ?? rawTypeName;
        }
        return "Không xác định";
      })(),
      categoryId: categoryId ? Number(categoryId) : undefined,
      categoryName:
        product.categoryName ??
        product.category_name ??
        product.category?.categoryName ??
        categoryLookup.get(Number(categoryId)) ??
        "Chưa phân loại",
      price: Number(product.price ?? 0),
      stockQuantity: Number(product.stockQuantity ?? product.stock_quantity ?? 0),
      description: product.description || "",
      _originalData: product, // Lưu data gốc để có thể lấy ID khi cần
    };
  };

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [categoriesResponse, productsResponse] = await Promise.all([
          categoryService.getAllCategoriesAdmin().catch(() => []),
          productService.getAllProductsCustomer(),
        ]);

        if (ignore) return;

        // Tạo mapping categoryName + typeId -> categoryId từ products (giống CategoryManagement)
        const categoryIdMap = new Map<string, number>();
        const productStats = new Map<number, number>();
        
        (productsResponse || []).forEach((product: Partial<Product> & Record<string, any>) => {
          const rawCategoryId =
            product.categoryId ??
            product.category_id ??
            product.category?.categoryId ??
            product.category?.category_id;
          const categoryId = rawCategoryId ? Number(rawCategoryId) : undefined;
          
          if (categoryId) {
            // Tạo key từ categoryName + typeId để map
            const categoryName = product.categoryName ?? product.category_name ?? product.category?.categoryName;
            const typeId = product.typeId ?? product.type_id ?? product.type?.typeId;
            if (categoryName && typeId) {
              const mapKey = `${categoryName}|${typeId}`;
              if (!categoryIdMap.has(mapKey)) {
                categoryIdMap.set(mapKey, categoryId);
              }
            }
            
            // Count products per category
            const current = productStats.get(categoryId) ?? 0;
            productStats.set(categoryId, current + 1);
          }
        });

        // Enrich categories với ID từ mapping (giống CategoryManagement)
        const enrichedCategories = (categoriesResponse || []).map((category: any) => {
          const categoryName = category.categoryName ?? category.category_name;
          const typeId = category.typeId ?? category.type_id;
          
          // Nếu chưa có ID, thử lấy từ mapping
          if (!category.categoryId && !category.category_id && !category.id) {
            if (categoryName && typeId) {
              const mapKey = `${categoryName}|${typeId}`;
              const mappedId = categoryIdMap.get(mapKey);
              if (mappedId) {
                return { ...category, categoryId: mappedId, _mappedId: true };
              }
            }
          }
          return category;
        });

        // Tạo categoryLookup với ID đã được enrich
        const categoryLookup = new Map<number, string>();
        enrichedCategories.forEach((category: any) => {
          const categoryId = category.categoryId ?? category.category_id ?? category.id;
          const categoryName = category.categoryName ?? category.category_name;
          if (categoryId && categoryName) {
            categoryLookup.set(Number(categoryId), categoryName);
          }
        });

        // Set categories state (để dùng trong form)
        // Log để debug
        console.log("📦 ProductManagement - Categories response:", categoriesResponse);
        console.log("🗺️  ProductManagement - Category ID mapping:", Array.from(categoryIdMap.entries()));
        console.log("✨ ProductManagement - Enriched categories:", enrichedCategories);
        
        setCategories(enrichedCategories as Category[]);

        // Log để kiểm tra response từ API có productId không
        console.log("🔍 ProductManagement: Kiểm tra productsResponse:", {
          totalProducts: productsResponse?.length || 0,
          firstProduct: productsResponse?.[0] ? {
            keys: Object.keys(productsResponse[0]),
            hasProductId: 'productId' in (productsResponse[0] || {}),
            productId: (productsResponse[0] as any)?.productId,
            sample: productsResponse[0]
          } : null
        });
        
        const normalizedProducts = (productsResponse || []).map((product) =>
          normalizeProduct(product, categoryLookup)
        );

        // Derive productTypes từ categories (giống CategoryManagement)
        const derivedTypes: ProductType[] = Array.from(
          new Map(
            enrichedCategories
              .filter((category: any) => {
                const typeId = category.typeId ?? category.type_id;
                return typeId != null;
              })
              .map((category: any) => {
                const typeId = category.typeId ?? category.type_id;
                const rawTypeName = category.type?.typeName ?? category.type_name;
                // Map typeId -> typeName nếu không có từ response
                const typeIdToName: Record<number, string> = {
                  1: "Cat",
                  2: "Food",
                  3: "Cage",
                  4: "Cleaning",
                };
                const typeName = rawTypeName ?? typeIdToName[Number(typeId)];
                return [Number(typeId), typeName ? (TYPE_NAME_MAP[typeName] ?? typeName) : "Không xác định"];
              })
          )
        ).map(([typeId, typeName]) => ({
          typeId: typeId as number,
          typeName: typeName as string,
        }));

        // Log sau khi derivedTypes được khai báo
        console.log("📊 ProductManagement - ProductTypes derived:", derivedTypes);

        setProductTypes(derivedTypes);
        setProducts(normalizedProducts);
        setFilteredProducts(normalizedProducts);
      } catch (error: any) {
        if (ignore) return;
        console.error("Error loading products:", error);
        toast({
          title: "Không thể tải sản phẩm",
          description: error?.message || "Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      ignore = true;
    };
  }, [toast]);

  // Filter products
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.description?.toLowerCase().includes(keyword) ||
        product.typeName?.toLowerCase().includes(keyword) ||
        product.categoryName?.toLowerCase().includes(keyword)
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((product) => product.typeId?.toString() === typeFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.categoryId?.toString() === categoryFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, typeFilter, categoryFilter]);

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      return;
    }
    try {
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      setFilteredProducts((prev) => prev.filter((product) => product.id !== productId));
      toast({
        title: "Đã xóa sản phẩm",
        description: `Sản phẩm #${productId} đã được xóa.`,
      });
    } catch (error: any) {
      console.error("Delete product error:", error);
      toast({
        title: "Xóa sản phẩm thất bại",
        description: error?.message || "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (product: AdminProduct) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleOpenAddForm = () => {
    setIsEditMode(false);
    setFormData({
      productName: "",
      typeId: "",
      categoryId: "none",
      price: "",
      stockQuantity: "",
      description: "",
    });
    setSelectedFile(null);
    setImagePreview(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (product: AdminProduct) => {
    setIsEditMode(true);
    setSelectedProduct(product);
    setFormData({
      productName: product.name,
      typeId: product.typeId?.toString() || "",
      categoryId: product.categoryId?.toString() || "none",
      price: product.price.toString(),
      stockQuantity: product.stockQuantity.toString(),
      description: product.description || "",
    });
    setSelectedFile(null);
    setImagePreview(null);
    setIsFormOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitForm = async () => {
    try {
      if (!formData.productName || !formData.typeId || !formData.price || !formData.stockQuantity) {
        toast({
          title: "Vui lòng điền đầy đủ thông tin",
          description: "Tên sản phẩm, loại, giá và số lượng là bắt buộc.",
          variant: "destructive",
        });
        return;
      }

      // Format data theo ProductRequest của backend
      // Backend yêu cầu: productName (String), typeId (Long), categoryId (Long, optional), 
      // price (BigDecimal), stockQuantity (Integer), description (String, optional)
      const productPayload: any = {
        productName: formData.productName,
        typeId: parseInt(formData.typeId),
        price: parseFloat(formData.price), // Backend sẽ convert sang BigDecimal
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        description: formData.description || null, // Backend có thể nhận null
      };

      // categoryId là optional trong ProductRequest
      // Nếu categoryId là ID tạm thời (>= 2000000), không gửi lên backend
      if (formData.categoryId && formData.categoryId !== "none") {
        const categoryIdNum = parseInt(formData.categoryId);
        if (categoryIdNum < 2000000) {
          // Chỉ gửi nếu là ID thực (< 2000000)
          productPayload.categoryId = categoryIdNum;
        }
        // Nếu là ID tạm thời (>= 2000000), bỏ qua (không gửi categoryId)
      }

      if (isEditMode && selectedProduct) {
        // Lấy ID từ nhiều nguồn: id field, _originalData, hoặc query lại từ API
        let productId = selectedProduct.id;
        
        console.log("🔍 ProductManagement: Bắt đầu tìm ID cho update:", {
          selectedProductId: selectedProduct.id,
          selectedProductName: selectedProduct.name,
          _originalData: selectedProduct._originalData,
          _originalDataKeys: selectedProduct._originalData ? Object.keys(selectedProduct._originalData) : []
        });
        
        // Nếu id = 0, thử lấy từ _originalData
        if (!productId || productId === 0) {
          const originalData = selectedProduct._originalData;
          if (originalData) {
            // Thử nhiều cách để lấy ID
            productId = originalData.productId ?? 
                       originalData.product_id ?? 
                       originalData.id ??
                       (originalData as any).data?.productId ??
                       null;
            console.log("🔄 Lấy ID từ _originalData:", { 
              productId, 
              originalData,
              availableKeys: Object.keys(originalData),
              hasProductId: 'productId' in originalData,
              hasProduct_id: 'product_id' in originalData,
              hasId: 'id' in originalData
            });
          }
        }
        
        // Nếu vẫn không có ID, query lại từ API để lấy data mới nhất
        if (!productId || productId === 0) {
          console.log("🔄 Query lại products từ API để tìm ID...");
          try {
            const freshProductsResponse = await productService.getAllProductsCustomer();
            const originalData = selectedProduct._originalData || selectedProduct;
            
            // Tìm product match dựa trên unique fields
            const matchedProduct = freshProductsResponse.find((p: any) => {
              const nameMatch = (p.productName ?? p.product_name ?? p.name) === selectedProduct.name;
              const priceMatch = Number(p.price) === Number(selectedProduct.price);
              const stockMatch = Number(p.stockQuantity ?? p.stock_quantity) === Number(selectedProduct.stockQuantity);
              const descMatch = (p.description || '') === (selectedProduct.description || '');
              
              return nameMatch && priceMatch && stockMatch && descMatch;
            });
            
            if (matchedProduct) {
              // Lấy ID từ matched product
              productId = matchedProduct.productId ?? matchedProduct.product_id ?? matchedProduct.id ?? null;
              console.log("✅ Tìm thấy product match từ fresh API response:", {
                productId,
                matchedProduct,
                hasProductId: 'productId' in matchedProduct,
                availableKeys: Object.keys(matchedProduct)
              });
              
              // Nếu vẫn không có ID, backend có thể chưa restart
              if (!productId || productId === 0) {
                console.error("❌ Backend vẫn chưa trả về productId. Có thể backend chưa được restart sau khi sửa code.");
              }
            } else {
              console.warn("⚠️ Không tìm thấy product match trong fresh API response");
            }
          } catch (error) {
            console.error("❌ Lỗi khi query fresh products:", error);
          }
        }
        
        // Nếu vẫn không có ID, thử tìm trong productIdMap bằng unique key
        if (!productId || productId === 0) {
          console.log("🔍 Không tìm thấy ID, đang tìm trong productIdMap...");
          const uniqueKey = `${selectedProduct.name}|${selectedProduct.price}|${selectedProduct.stockQuantity}|${selectedProduct.description || ''}`;
          const mappedId = productIdMap.get(uniqueKey);
          
          if (mappedId && mappedId >= 1000000) {
            // Nếu là mapped ID (>= 1000000), query lại products và dùng index để lấy product
            try {
              const productsResponse = await productService.getAllProductsCustomer();
              const index = mappedId - 1000000;
              
              if (productsResponse && productsResponse[index]) {
                const productAtIndex = productsResponse[index];
                
                // Query backend để lấy productId bằng cách search theo name và match các field khác
                // Nhưng vì backend không có endpoint search với đủ thông tin, ta cần một cách khác
                // Cách tốt nhất: Query tất cả products và tìm exact match
                const matchedProduct = productsResponse.find((p: any) => {
                  const nameMatch = (p.productName ?? p.product_name ?? p.name) === selectedProduct.name;
                  const priceMatch = Number(p.price) === Number(selectedProduct.price);
                  const stockMatch = Number(p.stockQuantity ?? p.stock_quantity) === Number(selectedProduct.stockQuantity);
                  const descMatch = (p.description || '') === (selectedProduct.description || '');
                  return nameMatch && priceMatch && stockMatch && descMatch;
                });
                
                if (matchedProduct) {
                  // Vẫn không có ID từ matched product vì backend không trả về
                  // Nhưng ta có thể thử search API để lấy ID
                  console.log("✅ Tìm thấy product match:", matchedProduct);
                  
                  // Thử search theo productName để lấy list và tìm exact match
                  const searchResults = await productService.searchProducts(selectedProduct.name);
                  const exactMatch = searchResults.find((p: Product) => {
                    return p.productName === selectedProduct.name &&
                           p.price === selectedProduct.price &&
                           p.stockQuantity === selectedProduct.stockQuantity;
                  });
                  
                  if (exactMatch && exactMatch.productId) {
                    productId = exactMatch.productId;
                    console.log("✅ Tìm thấy ID từ search:", productId);
                  }
                }
              }
            } catch (error) {
              console.error("❌ Lỗi khi query products để tìm ID:", error);
            }
          }
        }
        
        // Nếu vẫn không có ID hợp lệ, báo lỗi và hướng dẫn
        if (!productId || productId === 0) {
          console.error("❌ Invalid product ID for update:", {
            selectedProduct,
            id: selectedProduct.id,
            _originalData: selectedProduct._originalData,
          });
          
          // Kiểm tra xem backend có trả về productId không
          try {
            const testResponse = await productService.getAllProductsCustomer();
            const firstProduct = testResponse?.[0];
            const hasProductId = firstProduct && ('productId' in firstProduct || 'product_id' in firstProduct);
            
            const errorMessage = hasProductId 
              ? "Không tìm thấy ID sản phẩm. Vui lòng reload trang và thử lại."
              : "Backend không trả về productId. Vui lòng:\n1. Kiểm tra backend đã được restart chưa\n2. Kiểm tra ProductResponse.java có field productId\n3. Kiểm tra ProductMapper.java có mapping productId\n4. Rebuild và restart backend";
            
            toast({
              title: "Lỗi",
              description: errorMessage,
              variant: "destructive",
            });
          } catch (error) {
            toast({
              title: "Lỗi",
              description: "Không thể cập nhật sản phẩm: Không tìm thấy ID. Vui lòng kiểm tra backend và thử lại.",
              variant: "destructive",
            });
          }
          return;
        }
        
        // Update product
        console.log("🔄 Updating product with ID:", productId);
        await productService.updateProduct(productId, productPayload, selectedFile || undefined);
        toast({
          title: "Cập nhật thành công",
          description: `Sản phẩm "${formData.productName}" đã được cập nhật.`,
        });
      } else {
        // Create product
        if (!selectedFile) {
          toast({
            title: "Vui lòng chọn hình ảnh",
            description: "Hình ảnh sản phẩm là bắt buộc khi tạo mới.",
            variant: "destructive",
          });
          return;
        }
        await productService.createProduct(productPayload, selectedFile);
        toast({
          title: "Tạo thành công",
          description: `Sản phẩm "${formData.productName}" đã được tạo.`,
        });
      }

      // Reload products (giống logic trong useEffect)
      const [categoriesResponse, productsResponse] = await Promise.all([
        categoryService.getAllCategoriesAdmin().catch(() => []),
        productService.getAllProductsCustomer(),
      ]);

      // Tạo mapping categoryName + typeId -> categoryId từ products
      const categoryIdMap = new Map<string, number>();
      (productsResponse || []).forEach((product: Partial<Product> & Record<string, any>) => {
        const rawCategoryId =
          product.categoryId ??
          product.category_id ??
          product.category?.categoryId ??
          product.category?.category_id;
        const categoryId = rawCategoryId ? Number(rawCategoryId) : undefined;
        
        if (categoryId) {
          const categoryName = product.categoryName ?? product.category_name ?? product.category?.categoryName;
          const typeId = product.typeId ?? product.type_id ?? product.type?.typeId;
          if (categoryName && typeId) {
            const mapKey = `${categoryName}|${typeId}`;
            if (!categoryIdMap.has(mapKey)) {
              categoryIdMap.set(mapKey, categoryId);
            }
          }
        }
      });

      // Enrich categories với ID từ mapping
      const enrichedCategories = (categoriesResponse || []).map((category: any) => {
        const categoryName = category.categoryName ?? category.category_name;
        const typeId = category.typeId ?? category.type_id;
        
        if (!category.categoryId && !category.category_id && !category.id) {
          if (categoryName && typeId) {
            const mapKey = `${categoryName}|${typeId}`;
            const mappedId = categoryIdMap.get(mapKey);
            if (mappedId) {
              return { ...category, categoryId: mappedId, _mappedId: true };
            }
          }
        }
        return category;
      });

      // Tạo categoryLookup với ID đã được enrich
      const categoryLookup = new Map<number, string>();
      enrichedCategories.forEach((category: any) => {
        const categoryId = category.categoryId ?? category.category_id ?? category.id;
        const categoryName = category.categoryName ?? category.category_name;
        if (categoryId && categoryName) {
          categoryLookup.set(Number(categoryId), categoryName);
        }
      });

      // Set categories state
      setCategories(enrichedCategories as Category[]);

      const normalizedProducts = (productsResponse || []).map((product) =>
        normalizeProduct(product, categoryLookup)
      );

      // Derive productTypes từ categories
      const derivedTypes: ProductType[] = Array.from(
        new Map(
          enrichedCategories
            .filter((category: any) => {
              const typeId = category.typeId ?? category.type_id;
              return typeId != null;
            })
            .map((category: any) => {
              const typeId = category.typeId ?? category.type_id;
              const rawTypeName = category.type?.typeName ?? category.type_name;
              const typeIdToName: Record<number, string> = {
                1: "Cat",
                2: "Food",
                3: "Cage",
                4: "Cleaning",
              };
              const typeName = rawTypeName ?? typeIdToName[Number(typeId)];
              return [Number(typeId), typeName ? (TYPE_NAME_MAP[typeName] ?? typeName) : "Không xác định"];
            })
        )
      ).map(([typeId, typeName]) => ({
        typeId: typeId as number,
        typeName: typeName as string,
      }));

      setProductTypes(derivedTypes);
      setProducts(normalizedProducts);
      setFilteredProducts(normalizedProducts);
      setIsFormOpen(false);
    } catch (error: any) {
      console.error("Submit product error:", error);
      toast({
        title: isEditMode ? "Cập nhật thất bại" : "Tạo thất bại",
        description: error?.response?.data?.message || error?.message || "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Hết hàng</Badge>;
    }
    if (quantity < 10) {
      return <Badge variant="secondary">Sắp hết</Badge>;
    }
    return <Badge variant="default">Còn hàng</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Sản phẩm</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả sản phẩm trong hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất CSV
          </Button>
          <Button onClick={handleOpenAddForm}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mèo cảnh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {products.filter(p => p.typeId === 1).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Thức ăn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {products.filter(p => p.typeId === 2).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Phụ kiện</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {products.filter(p => p.typeId === 3 || p.typeId === 4).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Lọc theo loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {productTypes.map((type) => {
                  const typeId = type.typeId ?? type.type_id;
                  const typeName = type.typeName ?? type.type_name;
                  if (typeId == null) {
                    return null;
                  }
                  return (
                    <SelectItem key={`type-${typeId}`} value={typeId.toString()}>
                      {typeName || "Không xác định"}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Lọc theo danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.map((category: any, index: number) => {
                      // Lấy ID từ nhiều nguồn (giống normalizeCategory)
                      const categoryId = category.categoryId ?? 
                                        category.category_id ?? 
                                        category.id;
                      const categoryName = category.categoryName ?? category.category_name;
                      const typeId = category.typeId ?? category.type_id;
                      
                      // Nếu không có ID hợp lệ, dùng index tạm thời nhưng vẫn hiển thị
                      // Vì backend có thể không trả về ID, nhưng vẫn cần hiển thị category
                      if (!categoryName) {
                        return null; // Bỏ qua nếu không có tên
                      }
                      
                      // Nếu có ID hợp lệ (< 1000000), dùng ID đó
                      // Nếu không, dùng index + offset để tạo unique key
                      const displayId = (categoryId != null && categoryId < 1000000) 
                        ? categoryId 
                        : (index + 2000000); // Offset khác với CategoryManagement để tránh conflict
                      
                      // Tạo unique key từ name + typeId nếu không có ID
                      const uniqueKey = categoryId && categoryId < 1000000
                        ? `category-${categoryId}`
                        : `category-${categoryName}-${typeId}-${index}`;
                      
                      return (
                        <SelectItem key={uniqueKey} value={displayId.toString()}>
                          {categoryName || "Không có tên"}
                        </SelectItem>
                      );
                    })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sản phẩm ({filteredProducts.length})</CardTitle>
          <CardDescription>
            Hiển thị {filteredProducts.length} trong tổng số {products.length} sản phẩm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy sản phẩm nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product, index) => {
                    const rowKey =
                      product.id && product.id !== 0
                        ? `product-${product.id}`
                        : `product-index-${index}`;
                    return (
                      <TableRow key={rowKey}>
                      <TableCell className="font-mono text-sm">{product.id}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.typeName}</Badge>
                      </TableCell>
                      <TableCell>{product.categoryName}</TableCell>
                      <TableCell className="font-medium text-blue-600">
                        {formatCurrencyVND(product.price)}
                      </TableCell>
                      <TableCell>{product.stockQuantity}</TableCell>
                      <TableCell>{getStockBadge(product.stockQuantity)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(product)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenEditForm(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => product.id && handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Product Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết sản phẩm</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về sản phẩm
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tên sản phẩm</label>
                  <p className="text-lg font-semibold">{selectedProduct.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">ID</label>
                  <p className="font-mono">{selectedProduct.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Loại</label>
                  <p>{selectedProduct.typeName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Danh mục</label>
                  <p>{selectedProduct.categoryName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Giá</label>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatCurrencyVND(selectedProduct.price)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tồn kho</label>
                  <p>{selectedProduct.stockQuantity}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Mô tả</label>
                <p className="text-muted-foreground">{selectedProduct.description || "—"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Cập nhật thông tin sản phẩm" : "Điền thông tin để tạo sản phẩm mới"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">Tên sản phẩm *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="typeId">Loại sản phẩm *</Label>
                <Select value={formData.typeId} onValueChange={(value) => setFormData({ ...formData, typeId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((type) => {
                      const typeId = type.typeId ?? type.type_id;
                      const rawTypeName = type.typeName ?? type.type_name;
                      const typeName = rawTypeName ? (TYPE_NAME_MAP[rawTypeName] ?? rawTypeName) : "Không xác định";
                      if (typeId == null) return null;
                      return (
                        <SelectItem key={`type-${typeId}`} value={typeId.toString()}>
                          {typeName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="categoryId">Danh mục</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục (tùy chọn)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có</SelectItem>
                    {categories.length === 0 ? (
                      <SelectItem value="loading" disabled>
                        Đang tải danh mục... (có {categories.length} danh mục)
                      </SelectItem>
                    ) : (
                      categories.map((category: any, index: number) => {
                        // Lấy ID từ nhiều nguồn (giống normalizeCategory)
                        const categoryId = category.categoryId ?? 
                                          category.category_id ?? 
                                          category.id;
                        const categoryName = category.categoryName ?? category.category_name;
                        const typeId = category.typeId ?? category.type_id;
                        
                        // Nếu không có tên, bỏ qua
                        if (!categoryName) {
                          return null;
                        }
                        
                        // Nếu có ID hợp lệ (< 2000000), dùng ID đó
                        // Nếu không, dùng index + offset để tạo unique key
                        const displayId = (categoryId != null && categoryId < 2000000) 
                          ? categoryId 
                          : (index + 2000000); // Offset khác với CategoryManagement để tránh conflict
                        
                        // Tạo unique key từ name + typeId nếu không có ID
                        const uniqueKey = categoryId && categoryId < 2000000
                          ? `category-${categoryId}`
                          : `category-${categoryName}-${typeId}-${index}`;
                        
                        return (
                          <SelectItem key={uniqueKey} value={displayId.toString()}>
                            {categoryName || "Không có tên"}
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Giá (VNĐ) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="stockQuantity">Số lượng tồn kho *</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả sản phẩm"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="image">Hình ảnh {!isEditMode && "*"}</Label>
              <div className="mt-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-md border"
                    />
                  </div>
                )}
                {isEditMode && !imagePreview && selectedProduct && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Để trống nếu không muốn thay đổi hình ảnh
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmitForm}>
                {isEditMode ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
