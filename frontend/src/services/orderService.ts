import { apiService } from './api';
import { API_CONFIG, buildUrl } from '@/config/api';
import { Order, OrderDetail } from '@/types';

// Order Service
export const orderService = {
  // Lấy tất cả đơn hàng
  async getAllOrders(): Promise<Order[]> {
    return apiService.get<Order[]>(API_CONFIG.ENDPOINTS.ORDERS.LIST);
  },

  // Lấy đơn hàng theo ID
  async getOrderById(id: number): Promise<Order> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.ORDERS.DETAIL, { id });
    return apiService.get<Order>(url);
  },

  // Lấy đơn hàng theo user ID
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.ORDERS.USER_ORDERS, { userId });
    return apiService.get<Order[]>(url);
  },

  // Lấy chi tiết đơn hàng
  async getOrderDetails(orderId: number): Promise<OrderDetail[]> {
    return apiService.get<OrderDetail[]>(`${API_CONFIG.ENDPOINTS.ORDERS.DETAIL}/${orderId}/details`);
  },

  // Tạo đơn hàng mới
  async createOrder(orderData: Omit<Order, 'order_id' | 'order_date'>): Promise<Order> {
    return apiService.post<Order>(API_CONFIG.ENDPOINTS.ORDERS.CREATE, orderData);
  },

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.ORDERS.UPDATE, { id });
    return apiService.patch<Order>(url, { status });
  },

  // Cập nhật đơn hàng
  async updateOrder(id: number, orderData: Partial<Order>): Promise<Order> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.ORDERS.UPDATE, { id });
    return apiService.put<Order>(url, orderData);
  }
};
