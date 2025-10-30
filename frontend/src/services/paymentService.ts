import { apiService } from './api';
import { API_CONFIG, buildUrl } from '@/config/api';
import { Payment, SearchParams } from '@/types';

export const paymentService = {
  // General APIs
  getAll: async (): Promise<Payment[]> => {
    return apiService.get(API_CONFIG.ENDPOINTS.PAYMENTS.LIST);
  },

  create: async (data: Partial<Payment>): Promise<Payment> => {
    return apiService.post(API_CONFIG.ENDPOINTS.PAYMENTS.CREATE, data);
  },

  update: async (id: number, data: Partial<Payment>): Promise<Payment> => {
    return apiService.put(buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.UPDATE, { id }), data);
  },

  delete: async (id: number): Promise<void> => {
    return apiService.delete(buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.DELETE, { id }));
  },

  // Filter APIs
  getByOrder: async (orderId: number): Promise<Payment[]> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.BY_ORDER, { orderId }));
  },

  getByUser: async (userId: number): Promise<Payment[]> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.BY_USER, { userId }));
  },

  getByMethod: async (method: string): Promise<Payment[]> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.BY_METHOD, { method }));
  },

  getByDateRange: async (start: string, end: string): Promise<Payment[]> => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.PAYMENTS.BY_DATE_RANGE}?start=${start}&end=${end}`);
  },

  getByMinAmount: async (minAmount: number): Promise<Payment[]> => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.PAYMENTS.BY_MIN_AMOUNT}?min=${minAmount}`);
  },

  // Statistics APIs
  getTotalRevenue: async (): Promise<number> => {
    return apiService.get(API_CONFIG.ENDPOINTS.PAYMENTS.STATS_TOTAL);
  },

  getUserTotalRevenue: async (userId: number): Promise<number> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.STATS_USER_TOTAL, { userId }));
  },

  getMethodSummary: async (): Promise<[string, number, number][]> => {
    return apiService.get(API_CONFIG.ENDPOINTS.PAYMENTS.STATS_METHOD_SUMMARY);
  },

  // User APIs
  getUserAll: async (userId: number): Promise<Payment[]> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.USER_ALL, { userId }));
  },

  getUserByMethod: async (userId: number, method: string): Promise<Payment[]> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.USER_METHOD, { userId, method }));
  },

  getUserByDateRange: async (userId: number, start: string, end: string): Promise<Payment[]> => {
    return apiService.get(`${buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.USER_DATE_RANGE, { userId })}?start=${start}&end=${end}`);
  }
};
