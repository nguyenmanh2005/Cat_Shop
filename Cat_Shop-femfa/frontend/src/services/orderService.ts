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

  // Lấy chi tiết đơn hàng (order details)
  async getOrderDetails(orderId: number): Promise<OrderDetail[]> {
    const url = buildUrl('/order-details/order/:orderId', { orderId });
    return apiService.get<OrderDetail[]>(url);
  },

  // Tạo đơn hàng mới
  async createOrder(orderData: Omit<Order, 'order_id' | 'order_date'>): Promise<Order> {
    return apiService.post<Order>(API_CONFIG.ENDPOINTS.ORDERS.CREATE, orderData);
  },

  // Cập nhật đơn hàng (sử dụng orderId)
  async updateOrder(orderId: number, orderData: Partial<Order>): Promise<Order> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.ORDERS.UPDATE, { orderId });
    return apiService.put<Order>(url, orderData);
  },

  // Xóa đơn hàng (sử dụng orderId)
  async deleteOrder(orderId: number): Promise<void> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.ORDERS.DELETE, { orderId });
    return apiService.delete<void>(url);
  },

  // Lấy đơn hàng theo email
  async getOrdersByEmail(email: string): Promise<Order[]> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.ORDERS.USER_ORDERS_BY_EMAIL, { email });
    return apiService.get<Order[]>(url);
  }
};
