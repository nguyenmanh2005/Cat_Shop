import { apiService } from './api';
import { API_CONFIG, buildUrl } from '@/config/api';
import { Shipment, SearchParams } from '@/types';

export const shipmentService = {
  // Admin APIs
  getAll: async (): Promise<Shipment[]> => {
    return apiService.get(API_CONFIG.ENDPOINTS.SHIPMENTS.ADMIN_ALL);
  },

  getByStatus: async (status: string): Promise<Shipment[]> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.SHIPMENTS.ADMIN_STATUS, { status }));
  },

  getByAddress: async (address: string): Promise<Shipment[]> => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.SHIPMENTS.ADMIN_ADDRESS}?address=${encodeURIComponent(address)}`);
  },

  getByDateRange: async (startDate: string, endDate: string): Promise<Shipment[]> => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.SHIPMENTS.ADMIN_DATE_RANGE}?startDate=${startDate}&endDate=${endDate}`);
  },

  getCountByStatus: async (): Promise<[string, number][]> => {
    return apiService.get(API_CONFIG.ENDPOINTS.SHIPMENTS.ADMIN_COUNT_BY_STATUS);
  },

  getByOrder: async (orderId: number): Promise<Shipment[]> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.SHIPMENTS.ADMIN_BY_ORDER, { orderId }));
  },

  getByUser: async (userId: number): Promise<Shipment[]> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.SHIPMENTS.ADMIN_BY_USER, { userId }));
  },

  getCountThisMonth: async (): Promise<{ data: number }> => {
    return apiService.get(API_CONFIG.ENDPOINTS.SHIPMENTS.ADMIN_COUNT_MONTH);
  },

  create: async (data: Partial<Shipment>): Promise<Shipment> => {
    return apiService.post(API_CONFIG.ENDPOINTS.SHIPMENTS.ADMIN_CREATE, data);
  },

  update: async (id: number, data: Partial<Shipment>): Promise<Shipment> => {
    return apiService.put(buildUrl(API_CONFIG.ENDPOINTS.SHIPMENTS.ADMIN_UPDATE, { id }), data);
  },

  delete: async (id: number): Promise<void> => {
    return apiService.delete(buildUrl(API_CONFIG.ENDPOINTS.SHIPMENTS.ADMIN_DELETE, { id }));
  },

  // User APIs
  getUserAll: async (userId: number): Promise<Shipment[]> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.SHIPMENTS.USER_ALL, { userId }));
  },

  getUserByStatus: async (userId: number, status: string): Promise<Shipment[]> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.SHIPMENTS.USER_STATUS, { userId, status }));
  },

  getUserByDateRange: async (userId: number, startDate: string, endDate: string): Promise<Shipment[]> => {
    return apiService.get(`${buildUrl(API_CONFIG.ENDPOINTS.SHIPMENTS.USER_DATE_RANGE, { userId })}?startDate=${startDate}&endDate=${endDate}`);
  },

  getUserDetail: async (userId: number, shipmentId: number): Promise<Shipment> => {
    return apiService.get(buildUrl(API_CONFIG.ENDPOINTS.SHIPMENTS.USER_DETAIL, { userId, shipmentId }));
  }
};
