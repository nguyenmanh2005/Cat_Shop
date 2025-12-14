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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Folder,
  Download,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { categoryService, productService } from "@/services/productService";
import type { Category, ProductType, Product } from "@/types";

interface AdminCategory {
  id: number;
  name: string;
  description?: string;
  typeId?: number;
  typeName?: string;
  productCount: number;
  _originalData?: any; // Lưu original data từ API
  _uniqueKey?: string; // Key để identify category
}

// Map typeName từ database (tiếng Anh) sang tiếng Việt để hiển thị
const TYPE_NAME_MAP: Record<string, string> = {
  "Cat": "Mèo cảnh",
  "Food": "Thức ăn",
  "Cage": "Lồng chuồng",
  "Cleaning": "Vệ sinh",
  "Toy": "Đồ chơi",
};

const CategoryManagement = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<AdminCategory[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AdminCategory | null>(null);
  const [formData, setFormData] = useState({
    categoryName: "",
    typeId: "",
    description: "",
  });
  // Lưu original data để có thể lấy ID khi cần
  const [originalCategoriesData, setOriginalCategoriesData] = useState<Map<string, any>>(new Map());
  const { toast } = useToast();

  const normalizeCategory = (
    category: Partial<Category> & Record<string, any>,
    productStats: Map<number, number>,
    index: number
  ): AdminCategory | null => {
    // Debug: Log category để xem response thực tế từ backend
    if (index === 0) {
      console.log("📦 Category response từ backend:", category);
    }
    
    // Lấy ID từ nhiều nguồn (đã được enrich từ database)
    const rawId = category.categoryId ?? 
                  category.category_id ?? 
                  category.id ?? 
                  (category as any).categoryId ?? 
                  (category as any).id;
    
    const categoryName = category.categoryName ?? category.category_name ?? "";
    const typeId = category.typeId ?? category.type_id ?? category.type?.typeId ?? category.type?.type_id;
    
    // Nếu không có ID và không có name hợp lệ, bỏ qua
    if (!rawId && !categoryName) {
      console.warn("Category missing both ID and name, skipping:", category);
      return null;
    }
    
    // Tạo unique key để track category
    const uniqueKey = rawId ? `id-${rawId}` : `name-${categoryName}-type-${typeId}-idx-${index}`;
    
    // Lưu original data để có thể lấy ID sau
    const originalData = { ...category, _uniqueKey: uniqueKey, _index: index };
    
    // Lấy ID thật (đã được enrich từ database)
    const categoryId = rawId ? Number(rawId) : null;
    
    // Validate ID phải là số hợp lệ và > 0, và phải < 1000000 (ID thật từ database)
    if (categoryId !== null && (isNaN(categoryId) || categoryId <= 0 || categoryId >= 1000000)) {
      console.warn("Category has invalid ID:", categoryId, "Category:", category);
      // Nếu ID không hợp lệ hoặc là ID giả, không tạo category
      // Vì đã query từ database, nếu không có ID thì có thể category chưa được tạo
      return null;
    }

    // Nếu không có ID thật, không tạo category (đợi reload sau khi create)
    if (!categoryId) {
      console.warn("Category không có ID thật, bỏ qua:", category);
      return null;
    }

    return {
      id: categoryId, // Dùng ID thật từ database
      name: categoryName || `Danh mục #${index}`,
      description: category.description ?? "",
      typeId: typeId ? Number(typeId) : undefined,
      typeName: (() => {
        // Thử lấy typeName từ nhiều nguồn
        const rawTypeName = category.type?.typeName ?? 
                           category.type_name ?? 
                           category.typeName;
        if (rawTypeName) {
          // Nếu có typeName từ response, map sang tiếng Việt
          return TYPE_NAME_MAP[rawTypeName] ?? rawTypeName;
        }
        // Nếu không có typeName, dùng typeId để map
        if (typeId) {
          // Map typeId -> typeName (tạm thời hardcode, sau sẽ lấy từ API)
          const typeIdToName: Record<number, string> = {
            1: "Cat",      // Mèo cảnh
            2: "Food",     // Thức ăn
            3: "Cage",     // Lồng chuồng
            4: "Cleaning", // Vệ sinh
          };
          const mappedName = typeIdToName[Number(typeId)];
          if (mappedName) {
            return TYPE_NAME_MAP[mappedName] ?? mappedName;
          }
        }
        return "Không xác định";
      })(),
      productCount: categoryId ? (productStats.get(categoryId) ?? 0) : 0,
      _originalData: originalData, // Lưu original data để có thể lấy ID sau
      _uniqueKey: uniqueKey,
    };
  };

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [categoriesResponse, productsResponse] = await Promise.all([
          categoryService.getAllCategoriesAdmin(),
          productService.getAllProductsCustomer().catch(() => []),
        ]);

        if (ignore) return;

        // Tạo mapping categoryName + typeId -> categoryId từ products
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

        // Log để debug
        console.log("📦 Categories response from API:", categoriesResponse);
        console.log("🗺️  Category ID mapping từ products:", Array.from(categoryIdMap.entries()));
        
        // Query từng category từ database để lấy ID thật
        // Database có ID: 1, 2, 3, 4, 6 (và có thể nhiều hơn)
        // Thử query từ ID 1 đến 50 để tìm tất cả categories
        const dbCategoryMap = new Map<string, number>(); // categoryName|typeId -> categoryId
        const maxQueryId = 50; // Query tối đa 50 IDs
        
        try {
          console.log("🔍 Đang query categories từ database để lấy ID thật...");
          const queryPromises = [];
          for (let id = 1; id <= maxQueryId; id++) {
            queryPromises.push(
              categoryService.getCategoryById(id).catch(() => null)
            );
          }
          
          const dbCategories = await Promise.all(queryPromises);
          dbCategories.forEach((cat: any, index: number) => {
            if (cat) {
              const categoryId = index + 1; // ID thật từ database
              const categoryName = cat.categoryName ?? cat.category_name ?? "";
              const typeId = cat.typeId ?? cat.type_id;
              
              if (categoryName && typeId) {
                const mapKey = `${categoryName}|${typeId}`;
                dbCategoryMap.set(mapKey, categoryId);
                console.log(`✅ Tìm thấy category trong DB: ${mapKey} -> ID ${categoryId}`);
              }
            }
          });
          console.log(`📊 Đã query ${dbCategories.filter(c => c !== null).length} categories từ database`);
        } catch (error) {
          console.error("❌ Lỗi khi query categories từ database:", error);
        }
        
        // Enrich categories với ID thật từ database
        const enrichedCategories = (categoriesResponse || []).map((category: any, index: number) => {
          const categoryName = category.categoryName ?? category.category_name;
          const typeId = category.typeId ?? category.type_id;
          
          // 1. Nếu đã có ID trong response, dùng nó
          if (category.categoryId || category.category_id || category.id) {
            return category;
          }
          
          // 2. Thử lấy từ mapping từ products
          if (categoryName && typeId) {
            const mapKey = `${categoryName}|${typeId}`;
            const mappedId = categoryIdMap.get(mapKey);
            if (mappedId) {
              return { ...category, categoryId: mappedId, _mappedId: true };
            }
          }
          
          // 3. Query từ database mapping (ID thật)
          if (categoryName && typeId) {
            const mapKey = `${categoryName}|${typeId}`;
            const dbId = dbCategoryMap.get(mapKey);
            if (dbId) {
              return { ...category, categoryId: dbId, _fromDb: true };
            }
          }
          
          // 4. Nếu vẫn không có, để normalizeCategory xử lý (sẽ tạo ID tạm thời)
          return category;
        });
        
        const normalizedCategories = enrichedCategories
          .map((category, index) => normalizeCategory(category, productStats, index))
          .filter((cat): cat is AdminCategory => cat !== null);
        
        // Lưu mapping uniqueKey -> original data + categoryId mapping
        const dataMap = new Map<string, any>();
        const categoryIdMapping = new Map<string, number>(); // categoryName|typeId -> categoryId
        
        normalizedCategories.forEach((cat, idx) => {
          if (cat._uniqueKey) {
            // Tìm category tương ứng trong categoriesResponse
            const matchingCategory = categoriesResponse.find((c: any) => {
              const cName = c.categoryName ?? c.category_name;
              const cTypeId = c.typeId ?? c.type_id;
              return cName === cat.name && cTypeId === cat.typeId;
            });
            if (matchingCategory) {
              dataMap.set(cat._uniqueKey, matchingCategory);
            }
          }
          
          // Tạo mapping categoryName|typeId -> categoryId để dùng khi xóa
          const categoryName = cat.name;
          const typeId = cat.typeId;
          if (categoryName && typeId) {
            const mapKey = `${categoryName}|${typeId}`;
            // Dùng ID thật từ database (đã được query và match)
            if (cat.id && cat.id < 1000000) {
              categoryIdMapping.set(mapKey, cat.id);
              console.log(`✅ Lưu mapping: ${mapKey} -> ID ${cat.id} (từ database)`);
            } else {
              console.warn(`⚠️ Category "${categoryName}" không có ID hợp lệ:`, cat.id);
            }
          }
        });
        
        setOriginalCategoriesData(dataMap);
        
        // Log để debug
        console.log("🗺️ Category ID mapping for delete:", Array.from(categoryIdMapping.entries()));
        
        // Lưu mapping vào component state để dùng khi xóa
        (window as any).__categoryIdMapping = categoryIdMapping;
        
        console.log("Normalized categories:", normalizedCategories);

        const derivedTypes: ProductType[] = Array.from(
          new Map(
            normalizedCategories
              .filter((category) => category.typeId)
              .map((category) => [
                category.typeId!,
                category.typeName || "Không xác định",
              ])
          )
        ).map(([typeId, typeName]) => ({
          typeId,
          typeName,
        }));

        setProductTypes(derivedTypes);
        setCategories(normalizedCategories);
        setFilteredCategories(normalizedCategories);
      } catch (error: any) {
        if (ignore) return;
        console.error("Error loading categories:", error);
        toast({
          title: "Không thể tải danh mục",
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

  // Filter categories
  useEffect(() => {
    let filtered = categories;

    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter((category) =>
        category.name.toLowerCase().includes(keyword) ||
        category.description?.toLowerCase().includes(keyword) ||
        category.typeName?.toLowerCase().includes(keyword)
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((category) => category.typeId?.toString() === typeFilter);
    }

    setFilteredCategories(filtered);
  }, [categories, searchTerm, typeFilter]);

  const handleOpenAddForm = () => {
    setIsEditMode(false);
    setSelectedCategory(null);
    setFormData({
      categoryName: "",
      typeId: "",
      description: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (category: AdminCategory) => {
    // Lấy ID từ nhiều nguồn
    const realId = category._originalData?.categoryId ?? 
                   category._originalData?.category_id ?? 
                   category._originalData?.id ??
                   (category.id < 1000000 ? category.id : null); // Nếu ID < 1000000, đó là ID thực
    
    // Log để debug
    console.log("🔍 Edit category - ID check:", {
      categoryId: category.id,
      realId,
      originalData: category._originalData,
      category
    });
    
    if (!realId || realId >= 1000000) {
      toast({
        title: "Lỗi",
        description: `Không thể chỉnh sửa danh mục này vì không có ID hợp lệ từ backend. Category ID hiện tại: ${category.id}. Vui lòng tải lại trang hoặc kiểm tra backend response.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsEditMode(true);
    setSelectedCategory(category);
    setFormData({
      categoryName: category.name,
      typeId: category.typeId?.toString() || "",
      description: category.description || "",
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = async () => {
    try {
      if (!formData.categoryName || !formData.typeId) {
        toast({
          title: "Vui lòng điền đầy đủ thông tin",
          description: "Tên danh mục và loại sản phẩm là bắt buộc.",
          variant: "destructive",
        });
        return;
      }

      // Format data theo CategoryRequest của backend
      const categoryPayload = {
        categoryName: formData.categoryName,
        typeId: parseInt(formData.typeId),
        description: formData.description || null, // Backend có thể nhận null
      };

      if (isEditMode && selectedCategory) {
        // Lấy ID thật từ original data
        const realId = selectedCategory._originalData?.categoryId ?? 
                       selectedCategory._originalData?.category_id ?? 
                       selectedCategory._originalData?.id ??
                       (selectedCategory.id < 1000000 ? selectedCategory.id : null);
        
        if (!realId || realId >= 1000000) {
          toast({
            title: "Lỗi",
            description: "Không tìm thấy ID của danh mục. Vui lòng tải lại trang.",
            variant: "destructive",
          });
          return;
        }
        
        // Update category - Backend trả về CategoryResponse (không có ID)
        await categoryService.updateCategory(realId, categoryPayload);
        toast({
          title: "Cập nhật thành công",
          description: `Danh mục "${formData.categoryName}" đã được cập nhật.`,
        });
      } else {
        // Create category - Backend trả về CategoryResponse (không có ID)
        await categoryService.createCategory(categoryPayload);
        toast({
          title: "Tạo thành công",
          description: `Danh mục "${formData.categoryName}" đã được tạo.`,
        });
      }

      // Reload categories
      const [categoriesResponse, productsResponse] = await Promise.all([
        categoryService.getAllCategoriesAdmin(),
        productService.getAllProductsCustomer().catch(() => []),
      ]);

      const productStats = new Map<number, number>();
      (productsResponse || []).forEach((product: Partial<Product> & Record<string, any>) => {
        const rawId =
          product.categoryId ??
          product.category_id ??
          product.category?.categoryId ??
          product.category?.category_id;
        const categoryId = rawId ? Number(rawId) : undefined;
        if (!categoryId) return;
        const current = productStats.get(categoryId) ?? 0;
        productStats.set(categoryId, current + 1);
      });

      const normalizedCategories = (categoriesResponse || [])
        .map((category, index) => normalizeCategory(category, productStats, index))
        .filter((cat): cat is AdminCategory => cat !== null);

      const derivedTypes: ProductType[] = Array.from(
        new Map(
          normalizedCategories
            .filter((category) => category.typeId)
            .map((category) => [
              category.typeId!,
              category.typeName || "Không xác định",
            ])
        )
      ).map(([typeId, typeName]) => ({
        typeId,
        typeName,
      }));

      const dataMap = new Map<string, any>();
      normalizedCategories.forEach((cat, idx) => {
        if (cat._uniqueKey) {
          dataMap.set(cat._uniqueKey, categoriesResponse[idx]);
        }
      });
      setOriginalCategoriesData(dataMap);

      setProductTypes(derivedTypes);
      setCategories(normalizedCategories);
      setFilteredCategories(normalizedCategories);
      setIsFormOpen(false);
    } catch (error: any) {
      console.error("Submit category error:", error);
      toast({
        title: isEditMode ? "Cập nhật thất bại" : "Tạo thất bại",
        description: error?.response?.data?.message || error?.message || "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    // Tìm category để lấy ID thật
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy danh mục để xóa.",
        variant: "destructive",
      });
      return;
    }
    
    // Lấy ID thật từ nhiều nguồn
    let realId: number | null = null;
    
    // 1. Thử lấy từ original data
    realId = category._originalData?.categoryId ?? 
             category._originalData?.category_id ?? 
             category._originalData?.id ??
             null;
    
    // 2. Nếu không có, thử lấy từ mapping (categoryName|typeId -> categoryId)
    if (!realId || realId >= 1000000) {
      const categoryName = category.name;
      const typeId = category.typeId;
      if (categoryName && typeId) {
        const mapKey = `${categoryName}|${typeId}`;
        const mapping = (window as any).__categoryIdMapping as Map<string, number> | undefined;
        if (mapping && mapping.has(mapKey)) {
          realId = mapping.get(mapKey)!;
          console.log("✅ Lấy ID từ mapping:", mapKey, "->", realId);
        }
      }
    }
    
    // 3. Nếu categoryId < 1000000, đó là ID thực
    if (!realId || realId >= 1000000) {
      if (categoryId < 1000000) {
        realId = categoryId;
      }
    }
    
    // 4. Nếu vẫn không có, thử query từ API bằng categoryName + typeId
    if (!realId || realId >= 1000000) {
      // Thử tìm trong categories response hiện tại
      try {
        const allCategories = await categoryService.getAllCategoriesAdmin();
        const categoryName = category.name;
        const typeId = category.typeId;
        
        // Tìm category có cùng name và typeId trong response
        // Vì backend không trả về ID, ta không thể lấy từ đây
        // Nhưng có thể thử query từ products
        console.warn("⚠️ Không tìm thấy ID thực từ mapping, category:", category);
      } catch (error) {
        console.error("Error querying categories:", error);
      }
    }
    
    if (!realId || realId >= 1000000) {
      toast({
        title: "Lỗi",
        description: `Không tìm thấy ID hợp lệ của danh mục "${category.name}". Category ID hiện tại: ${categoryId}. Vui lòng kiểm tra console log và reload trang.`,
        variant: "destructive",
      });
      console.error("❌ Không thể xóa category - không có ID hợp lệ:", {
        category,
        categoryId,
        realId,
        mapping: (window as any).__categoryIdMapping,
      });
      return;
    }
    
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}" (ID: ${realId})?`)) return;
    
    try {
      console.log("🗑️ Đang xóa category với ID:", realId);
      await categoryService.deleteCategory(realId);
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      setFilteredCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      toast({
        title: "Đã xóa danh mục",
        description: `Danh mục "${category.name}" đã được xóa thành công.`,
      });
    } catch (error: any) {
      console.error("Delete category error:", error);
      toast({
        title: "Xóa danh mục thất bại",
        description: error?.response?.data?.message || error?.message || "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const handleExportCategories = () => {
    const csvContent = [
      ["ID", "Tên danh mục", "Loại sản phẩm", "Mô tả", "Số sản phẩm"],
      ...filteredCategories.map((category) => [
        category.id,
        category.name,
        category.typeName,
        category.description,
        category.productCount,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `categories_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
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
          <h1 className="text-2xl font-bold">Quản lý Danh mục</h1>
          <p className="text-muted-foreground">
            Quản lý các danh mục sản phẩm trong hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCategories}>
            <Download className="h-4 w-4 mr-2" />
            Xuất CSV
          </Button>
          <Button onClick={handleOpenAddForm}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm danh mục
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mèo cảnh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {categories.filter(c => c.typeId === 1).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Thức ăn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {categories.filter(c => c.typeId === 2).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Phụ kiện</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {categories.filter(c => c.typeId === 3 || c.typeId === 4).length}
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
                  placeholder="Tìm kiếm danh mục..."
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
                {productTypes.map((type) => (
                  <SelectItem key={type.typeId} value={type.typeId.toString()}>
                    {type.typeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh mục ({filteredCategories.length})</CardTitle>
          <CardDescription>
            Hiển thị {filteredCategories.length} trong tổng số {categories.length} danh mục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Loại sản phẩm</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Số sản phẩm</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy danh mục nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category, index) => (
                    <TableRow key={category._uniqueKey || `category-${category.id}-${index}`}>
                      <TableCell className="font-mono text-sm">{category.id}</TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.typeName}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category.productCount} sản phẩm</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenEditForm(category)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Folder className="mr-2 h-4 w-4" />
                              Xem sản phẩm
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Category Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Cập nhật thông tin danh mục" : "Điền thông tin để tạo danh mục mới"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Tên danh mục *</Label>
              <Input
                id="categoryName"
                value={formData.categoryName}
                onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                placeholder="Nhập tên danh mục"
              />
            </div>

            <div>
              <Label htmlFor="typeId">Loại sản phẩm *</Label>
              <Select
                value={formData.typeId}
                onValueChange={(value) => setFormData({ ...formData, typeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại sản phẩm" />
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
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả danh mục"
                rows={4}
              />
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

export default CategoryManagement;
