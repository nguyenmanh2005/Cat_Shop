import { apiService } from './api';
import { API_CONFIG, buildUrl } from '@/config/api';
import { CleaningDetail, PaginatedResponse, ProductSearchParams } from '@/types';

export const cleaningDetailService = {
  // Admin APIs
  create: async (data: Partial<CleaningDetail>): Promise<CleaningDetail> => {
    return apiService.post(API_CONFIG.ENDPOINTS.CLEANING_DETAILS.CREATE, data);
  },

  update: async (id: number, data: Partial<CleaningDetail>): Promise<CleaningDetail> => {
    return apiService.put(buildUrl(API_CONFIG.ENDPOINTS.CLEANING_DETAILS.UPDATE, { id }), data);
  },

  delete: async (id: number): Promise<void> => {
    return apiService.delete(buildUrl(API_CONFIG.ENDPOINTS.CLEANING_DETAILS.DELETE, { id }));
  },

  getAdminById: async (id: number): Promise<CleaningDetail> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.CLEANING_DETAILS.ADMIN_DETAIL, { id }));
  },

  getAdminList: async (params?: ProductSearchParams): Promise<PaginatedResponse<CleaningDetail>> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    const url = `${API_CONFIG.ENDPOINTS.CLEANING_DETAILS.ADMIN_LIST}?${queryParams.toString()}`;
    return apiService.getFull(url);
  },

  searchByUsage: async (usage: string, isAdmin: boolean = true): Promise<CleaningDetail[]> => {
    const endpoint = isAdmin 
      ? API_CONFIG.ENDPOINTS.CLEANING_DETAILS.ADMIN_SEARCH
      : API_CONFIG.ENDPOINTS.CLEANING_DETAILS.CUSTOMER_SEARCH;
    return apiService.get(`${endpoint}?usage=${encodeURIComponent(usage)}`);
  },

  // Customer APIs
  getCustomerList: async (params?: ProductSearchParams): Promise<PaginatedResponse<CleaningDetail>> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    const url = `${API_CONFIG.ENDPOINTS.CLEANING_DETAILS.CUSTOMER_SEARCH}?${queryParams.toString()}`;
    return apiService.getFull(url);
  },

  getCustomerById: async (id: number): Promise<CleaningDetail> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.CLEANING_DETAILS.DETAIL, { id }));
  }
};
