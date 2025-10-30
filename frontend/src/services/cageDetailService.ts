import { apiService } from './api';
import { API_CONFIG, buildUrl } from '@/config/api';
import { CageDetail, PaginatedResponse, ProductSearchParams } from '@/types';

export const cageDetailService = {
  // Admin APIs
  create: async (data: Partial<CageDetail>): Promise<CageDetail> => {
    return apiService.post(API_CONFIG.ENDPOINTS.CAGE_DETAILS.CREATE, data);
  },

  update: async (id: number, data: Partial<CageDetail>): Promise<CageDetail> => {
    return apiService.put(buildUrl(API_CONFIG.ENDPOINTS.CAGE_DETAILS.UPDATE, { id }), data);
  },

  delete: async (id: number): Promise<void> => {
    return apiService.delete(buildUrl(API_CONFIG.ENDPOINTS.CAGE_DETAILS.DELETE, { id }));
  },

  getAdminById: async (id: number): Promise<CageDetail> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.CAGE_DETAILS.ADMIN_DETAIL, { id }));
  },

  getAdminList: async (params?: ProductSearchParams): Promise<PaginatedResponse<CageDetail>> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.material) queryParams.append('material', params.material);
    
    const url = `${API_CONFIG.ENDPOINTS.CAGE_DETAILS.ADMIN_SEARCH}?${queryParams.toString()}`;
    return apiService.getFull(url);
  },

  // Customer APIs
  getCustomerList: async (params?: ProductSearchParams): Promise<PaginatedResponse<CageDetail>> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.material) queryParams.append('material', params.material);
    
    const url = `${API_CONFIG.ENDPOINTS.CAGE_DETAILS.CUSTOMER_SEARCH}?${queryParams.toString()}`;
    return apiService.getFull(url);
  },

  getCustomerById: async (id: number): Promise<CageDetail> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.CAGE_DETAILS.DETAIL, { id }));
  }
};
