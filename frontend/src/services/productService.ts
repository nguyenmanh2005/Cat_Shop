import { apiService } from './api';
import { API_CONFIG, buildUrl } from '@/config/api';
import { Product, ProductType, Category } from '@/types';

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
    return apiService.get<Product[]>(`${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?typeId=${typeId}`);
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
    return apiService.get<Product[]>(`${API_CONFIG.ENDPOINTS.PRODUCTS.SEARCH}?q=${encodeURIComponent(searchTerm)}`);
  },

  // Tạo sản phẩm mới
  async createProduct(productData: Omit<Product, 'product_id'>): Promise<Product> {
    return apiService.post<Product>(API_CONFIG.ENDPOINTS.PRODUCTS.CREATE, productData);
  },

  // Cập nhật sản phẩm
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE, { id });
    return apiService.put<Product>(url, productData);
  },

  // Xóa sản phẩm
  async deleteProduct(id: number): Promise<void> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.PRODUCTS.DELETE, { id });
    return apiService.delete<void>(url);
  }
};

// ProductType Service
export const productTypeService = {
  // Lấy tất cả loại sản phẩm
  async getAllProductTypes(): Promise<ProductType[]> {
    return apiService.get<ProductType[]>(API_CONFIG.ENDPOINTS.PRODUCT_TYPES.LIST);
  },

  // Lấy loại sản phẩm theo ID
  async getProductTypeById(id: number): Promise<ProductType> {
    return apiService.get<ProductType>(`${API_CONFIG.ENDPOINTS.PRODUCT_TYPES.LIST}/${id}`);
  }
};

// Category Service
export const categoryService = {
  // Lấy tất cả danh mục
  async getAllCategories(): Promise<Category[]> {
    return apiService.get<Category[]>(API_CONFIG.ENDPOINTS.CATEGORIES.LIST);
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

  // Tạo danh mục mới
  async createCategory(categoryData: Omit<Category, 'category_id'>): Promise<Category> {
    return apiService.post<Category>(API_CONFIG.ENDPOINTS.CATEGORIES.CREATE, categoryData);
  },

  // Cập nhật danh mục
  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.CATEGORIES.UPDATE, { id });
    return apiService.put<Category>(url, categoryData);
  },

  // Xóa danh mục
  async deleteCategory(id: number): Promise<void> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.CATEGORIES.DELETE, { id });
    return apiService.delete<void>(url);
  },
  async getAllProductsCustomer(): Promise<Product[]> {
  return apiService.get<Product[]>("/customer/products");
  }

};
