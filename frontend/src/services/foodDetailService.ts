import { apiService } from './api';
import { API_CONFIG, buildUrl } from '@/config/api';
import { FoodDetail, PaginatedResponse, ProductSearchParams } from '@/types';

export const foodDetailService = {
  // Admin APIs
  create: async (data: Partial<FoodDetail>): Promise<FoodDetail> => {
    return apiService.post(API_CONFIG.ENDPOINTS.FOOD_DETAILS.CREATE, data);
  },

  update: async (id: number, data: Partial<FoodDetail>): Promise<FoodDetail> => {
    return apiService.put(buildUrl(API_CONFIG.ENDPOINTS.FOOD_DETAILS.UPDATE, { id }), data);
  },

  delete: async (id: number): Promise<void> => {
    return apiService.delete(buildUrl(API_CONFIG.ENDPOINTS.FOOD_DETAILS.DELETE, { id }));
  },

  getById: async (id: number): Promise<FoodDetail> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.FOOD_DETAILS.DETAIL, { id }));
  },

  getAdminList: async (params?: ProductSearchParams): Promise<PaginatedResponse<FoodDetail>> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `${API_CONFIG.ENDPOINTS.FOOD_DETAILS.ADMIN_LIST}?${queryParams.toString()}`;
    return apiService.getFull(url);
  },

  searchByIngredients: async (ingredients: string): Promise<FoodDetail[]> => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.FOOD_DETAILS.SEARCH_INGREDIENTS}?ingredients=${encodeURIComponent(ingredients)}`);
  },

  filterByExpiry: async (expiryBefore: string): Promise<FoodDetail[]> => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.FOOD_DETAILS.FILTER_EXPIRY}?expiryBefore=${expiryBefore}`);
  },

  searchAndFilter: async (ingredients: string, expiryBefore: string): Promise<FoodDetail[]> => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.FOOD_DETAILS.SEARCH_FILTER}?ingredients=${encodeURIComponent(ingredients)}&expiryBefore=${expiryBefore}`);
  },

  // Customer APIs
  getCustomerList: async (params?: ProductSearchParams): Promise<PaginatedResponse<FoodDetail>> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    const url = `${API_CONFIG.ENDPOINTS.FOOD_DETAILS.LIST}?${queryParams.toString()}`;
    return apiService.getFull(url);
  },

  getCustomerById: async (id: number): Promise<FoodDetail> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.FOOD_DETAILS.DETAIL, { id }));
  },

  searchCustomerByIngredients: async (ingredients: string): Promise<FoodDetail[]> => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.FOOD_DETAILS.CUSTOMER_SEARCH}?ingredients=${encodeURIComponent(ingredients)}`);
  }
};
