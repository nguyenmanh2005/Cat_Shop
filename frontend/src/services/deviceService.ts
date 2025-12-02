import { apiService } from './api';
import { API_CONFIG, buildUrl } from '@/config/api';
import { TrustedDevice } from '@/types';

// Device Service - Quản lý thiết bị đã đăng nhập
export const deviceService = {
  /**
   * Lấy danh sách thiết bị đã đăng nhập của user
   * @param email Email của user
   * @returns Danh sách thiết bị đã đăng nhập
   */
  async getUserDevices(email: string): Promise<TrustedDevice[]> {
    return apiService.get<TrustedDevice[]>(
      API_CONFIG.ENDPOINTS.AUTH.DEVICES,
      { params: { email } }
    );
  },

  /**
   * Xóa một thiết bị cụ thể
   * @param deviceId ID của thiết bị cần xóa
   * @param email Email của user
   * @returns Thông báo thành công
   */
  async removeDevice(deviceId: number, email: string): Promise<string> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.AUTH.DEVICE_DELETE, { deviceId });
    return apiService.delete<string>(url, { params: { email } });
  },

  /**
   * Xóa tất cả thiết bị (trừ thiết bị hiện tại)
   * @param email Email của user
   * @returns Thông báo thành công
   */
  async removeAllDevices(email: string): Promise<string> {
    return apiService.delete<string>(
      API_CONFIG.ENDPOINTS.AUTH.DEVICES_DELETE_ALL,
      { params: { email } }
    );
  }
};

