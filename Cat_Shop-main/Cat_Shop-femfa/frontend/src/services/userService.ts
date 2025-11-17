import { apiService } from './api';
import { API_CONFIG, buildUrl } from '@/config/api';
import { User } from '@/types';

// User Service
export const userService = {
  // Lấy tất cả người dùng
  async getAllUsers(): Promise<User[]> {
    return apiService.get<User[]>(API_CONFIG.ENDPOINTS.USERS.LIST);
  },

  // Lấy người dùng theo ID
  async getUserById(id: number): Promise<User> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.USERS.DETAIL, { id });
    return apiService.get<User>(url);
  },

  // Lấy người dùng theo email
  async getUserByEmail(email: string): Promise<User> {
    return apiService.get<User>(`/users/email/${encodeURIComponent(email)}`);
  },

  // Lấy người dùng theo username
  async getUserByUsername(username: string): Promise<User> {
    return apiService.get<User>(`${API_CONFIG.ENDPOINTS.USERS.LIST}?username=${encodeURIComponent(username)}`);
  },

  // Tạo người dùng mới
  async createUser(userData: Omit<User, 'user_id'>): Promise<User> {
    return apiService.post<User>(API_CONFIG.ENDPOINTS.USERS.CREATE, userData);
  },

  // Cập nhật thông tin người dùng
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.USERS.UPDATE, { id });
    return apiService.put<User>(url, userData);
  },

  // Xóa người dùng
  async deleteUser(id: number): Promise<void> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.USERS.DELETE, { id });
    return apiService.delete<void>(url);
  },

  // Lấy profile người dùng hiện tại
  async getProfile(): Promise<User> {
    return apiService.get<User>(API_CONFIG.ENDPOINTS.USERS.PROFILE);
  },

  // Đổi mật khẩu
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(
      API_CONFIG.ENDPOINTS.USERS.CHANGE_PASSWORD,
      { currentPassword, newPassword }
    );
  }
};
