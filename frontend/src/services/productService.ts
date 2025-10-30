import { apiService } from './api';
import { API_CONFIG, buildUrl } from '@/config/api';
import { Product, ProductType, Category, PaginatedResponse, ProductSearchParams } from '@/types';

// Product Service - gọi API backend
export const productService = {
  // Lấy tất cả sản phẩm (Customer)
  async getAllProducts(params?: ProductSearchParams): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`;
    return apiService.getFull(url);
  },

  // Lấy sản phẩm theo ID (Customer)
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

  // Tìm kiếm sản phẩm
  async searchProducts(keyword: string): Promise<Product[]> {
    return apiService.get<Product[]>(`${API_CONFIG.ENDPOINTS.PRODUCTS.SEARCH}?keyword=${encodeURIComponent(keyword)}`);
  },

  // Lọc sản phẩm theo giá
  async getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    return apiService.get<Product[]>(`${API_CONFIG.ENDPOINTS.PRODUCTS.PRICE_RANGE}?min=${minPrice}&max=${maxPrice}`);
  },

  // Tạo sản phẩm mới (Admin)
  async createProduct(productData: Omit<Product, 'productId'>): Promise<Product> {
    return apiService.post<Product>(API_CONFIG.ENDPOINTS.PRODUCTS.CREATE, productData);
  },

  // Cập nhật sản phẩm (Admin)
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE, { id });
    return apiService.put<Product>(url, productData);
  },

  // Xóa sản phẩm (Admin)
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
  // Lấy tất cả danh mục (Customer - chỉ danh mục có sản phẩm)
  async getAllCategories(): Promise<Category[]> {
    return apiService.get<Category[]>(API_CONFIG.ENDPOINTS.CATEGORIES.LIST);
  },

  // Lấy tất cả danh mục (Admin)
  async getAllCategoriesAdmin(): Promise<Category[]> {
    return apiService.get<Category[]>(API_CONFIG.ENDPOINTS.CATEGORIES.ADMIN_LIST);
  },

  // Lấy danh mục theo ID
  async getCategoryById(id: number): Promise<Category> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.CATEGORIES.DETAIL, { id });
    return apiService.get<Category>(url);
  },

  // Lấy danh mục kèm sản phẩm
  async getCategoryWithProducts(id: number): Promise<Category & { products: Product[] }> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.CATEGORIES.WITH_PRODUCTS, { id });
    return apiService.get<Category & { products: Product[] }>(url);
  },

  // Tạo danh mục mới (Admin)
  async createCategory(categoryData: Omit<Category, 'categoryId'>): Promise<Category> {
    return apiService.post<Category>(API_CONFIG.ENDPOINTS.CATEGORIES.CREATE, categoryData);
  },

  // Cập nhật danh mục (Admin)
  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.CATEGORIES.UPDATE, { id });
    return apiService.put<Category>(url, categoryData);
  },

  // Xóa danh mục (Admin)
  async deleteCategory(id: number): Promise<void> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.CATEGORIES.DELETE, { id });
    return apiService.delete<void>(url);
  }
};
