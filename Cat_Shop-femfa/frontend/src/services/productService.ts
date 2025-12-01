import { apiService, api } from './api';
import { API_CONFIG, buildUrl } from '@/config/api';
import { Product, Category } from '@/types';

// Product Service - gọi API backend
export const productService = {
  // Lấy tất cả sản phẩm
  async getAllProducts(): Promise<Product[]> {
    return apiService.get<Product[]>(API_CONFIG.ENDPOINTS.PRODUCTS.LIST);
  },

  // Lấy sản phẩm theo ID
  async getProductById(id: number): Promise<Product> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.PRODUCTS.DETAIL, { id });
    return apiService.get<Product>(url);
  },

  // Lấy sản phẩm theo loại
  async getProductsByType(typeId: number): Promise<Product[]> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.PRODUCTS.BY_TYPE, { typeId });
    return apiService.get<Product[]>(url);
  },

  // Lấy sản phẩm theo danh mục
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.PRODUCTS.BY_CATEGORY, { categoryId });
    return apiService.get<Product[]>(url);
  },

  // Lấy sản phẩm nổi bật
  async getFeaturedProducts(): Promise<Product[]> {
    return apiService.get<Product[]>(API_CONFIG.ENDPOINTS.PRODUCTS.FEATURED);
  },

  // Tìm kiếm sản phẩm
  async searchProducts(searchTerm: string): Promise<Product[]> {
    return apiService.get<Product[]>(`${API_CONFIG.ENDPOINTS.PRODUCTS.SEARCH}?keyword=${encodeURIComponent(searchTerm)}`);
  },

  // Tạo sản phẩm mới (với file upload - multipart/form-data)
  // Backend yêu cầu: @RequestPart("product") String productJson và @RequestPart("file") MultipartFile file
  async createProduct(productData: Omit<Product, 'product_id'>, file?: File): Promise<Product> {
    const formData = new FormData();
    formData.append('product', JSON.stringify(productData));
    if (file) {
      formData.append('file', file);
    }
    
    return api.post<Product>(API_CONFIG.ENDPOINTS.PRODUCTS.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(response => response.data.data);
  },

  // Cập nhật sản phẩm (với file upload - multipart/form-data)
  // Backend yêu cầu: @RequestPart String productJson (không có tên, mặc định tìm "productJson") và @RequestPart(value = "file", required = false) MultipartFile file
  async updateProduct(id: number, productData: Partial<Product>, file?: File): Promise<Product> {
    if (!id || id === 0) {
      throw new Error(`Invalid product ID: ${id}. Cannot update product.`);
    }
    
    const url = buildUrl(API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE, { id });
    const formData = new FormData();
    // Backend UPDATE yêu cầu field tên là "productJson" (không có @RequestPart("product"))
    formData.append('productJson', JSON.stringify(productData));
    if (file) {
      formData.append('file', file);
    }
    
    console.log("📤 productService.updateProduct:", {
      id,
      url,
      productData,
      hasFile: !!file,
      formDataKeys: Array.from(formData.keys())
    });
    
    return api.put<Product>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(response => response.data.data);
  },

  // Xóa sản phẩm
  async deleteProduct(id: number): Promise<void> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.PRODUCTS.DELETE, { id });
    return apiService.delete<void>(url);
  },

  // Lấy tất cả sản phẩm cho customer (public API)
  async getAllProductsCustomer(): Promise<Product[]> {
    try {
      return await apiService.get<Product[]>(API_CONFIG.ENDPOINTS.PRODUCTS.LIST);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      // Trả về mảng rỗng nếu có lỗi để tránh crash
      return [];
    }
  }
};

// Category Service
export const categoryService = {
  // Lấy tất cả danh mục (customer - chỉ danh mục khả dụng)
  async getAllCategories(): Promise<Category[]> {
    return apiService.get<Category[]>(API_CONFIG.ENDPOINTS.CATEGORIES.LIST);
  },

  // Lấy tất cả danh mục (admin - tất cả danh mục)
  async getAllCategoriesAdmin(): Promise<Category[]> {
    return apiService.get<Category[]>(API_CONFIG.ENDPOINTS.CATEGORIES.LIST_ADMIN);
  },

  // Lấy danh mục theo ID
  async getCategoryById(id: number): Promise<Category> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.CATEGORIES.DETAIL, { id });
    return apiService.get<Category>(url);
  },

  // Lấy danh mục theo loại sản phẩm
  async getCategoriesByType(typeId: number): Promise<Category[]> {
    return apiService.get<Category[]>(`${API_CONFIG.ENDPOINTS.CATEGORIES.LIST}?typeId=${typeId}`);
  },

  // Lấy danh mục kèm sản phẩm
  async getCategoryWithProducts(id: number): Promise<Category & { products: Product[] }> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.CATEGORIES.WITH_PRODUCTS, { id });
    return apiService.get<Category & { products: Product[] }>(url);
  },

  // Tạo danh mục mới (admin)
  // Backend CategoryRequest: categoryName (String), typeId (Long), description (String, optional)
  async createCategory(categoryData: { categoryName: string; typeId: number; description?: string | null }): Promise<Category> {
    return apiService.post<Category>(API_CONFIG.ENDPOINTS.CATEGORIES.CREATE, categoryData);
  },

  // Cập nhật danh mục (admin)
  // Backend CategoryRequest: categoryName (String), typeId (Long), description (String, optional)
  async updateCategory(id: number, categoryData: { categoryName: string; typeId: number; description?: string | null }): Promise<Category> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.CATEGORIES.UPDATE, { id });
    return apiService.put<Category>(url, categoryData);
  },

  // Xóa danh mục (admin)
  async deleteCategory(id: number): Promise<void> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.CATEGORIES.DELETE, { id });
    return apiService.delete<void>(url);
  },

  // Lấy danh sách danh mục cho customer
  async getAllCategoriesCustomer(): Promise<Category[]> {
    return apiService.get<Category[]>(API_CONFIG.ENDPOINTS.CATEGORIES.LIST);
  }
};
