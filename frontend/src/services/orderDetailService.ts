import { apiService } from './api';
import { API_CONFIG, buildUrl } from '@/config/api';
import { OrderDetail } from '@/types';

export const orderDetailService = {
  // General APIs
  getAll: async (): Promise<OrderDetail[]> => {
    return apiService.get(API_CONFIG.ENDPOINTS.ORDER_DETAILS.LIST);
  },

  getById: async (id: number): Promise<OrderDetail> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.ORDER_DETAILS.DETAIL, { id }));
  },

  create: async (data: Partial<OrderDetail>): Promise<OrderDetail> => {
    return apiService.post(API_CONFIG.ENDPOINTS.ORDER_DETAILS.CREATE, data);
  },

  update: async (id: number, data: Partial<OrderDetail>): Promise<OrderDetail> => {
    return apiService.put(buildUrl(API_CONFIG.ENDPOINTS.ORDER_DETAILS.UPDATE, { id }), data);
  },

  delete: async (id: number): Promise<void> => {
    return apiService.delete(buildUrl(API_CONFIG.ENDPOINTS.ORDER_DETAILS.DELETE, { id }));
  },

  // Filter APIs
  getByOrder: async (orderId: number): Promise<OrderDetail[]> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.ORDER_DETAILS.BY_ORDER, { orderId }));
  },

  getByProduct: async (productId: number): Promise<OrderDetail[]> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.ORDER_DETAILS.BY_PRODUCT, { productId }));
  },

  getOrderTotal: async (orderId: number): Promise<number> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.ORDER_DETAILS.ORDER_TOTAL, { orderId }));
  },

  // Admin APIs
  getAdminRevenue: async (): Promise<number> => {
    return apiService.get(API_CONFIG.ENDPOINTS.ORDER_DETAILS.ADMIN_REVENUE);
  }
};
