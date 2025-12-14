import { apiService } from './api';
import { API_CONFIG, buildUrl } from '@/config/api';
import { CatDetail } from '@/types';

// CatDetail Service
export const catDetailService = {
  // Lấy tất cả chi tiết mèo
  async getAllCatDetails(): Promise<CatDetail[]> {
    return apiService.get<CatDetail[]>(API_CONFIG.ENDPOINTS.CAT_DETAILS.LIST);
  },

  // Lấy chi tiết mèo theo ID
  async getCatDetailById(catId: number): Promise<CatDetail> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.CAT_DETAILS.DETAIL, { id: catId });
    return apiService.get<CatDetail>(url);
  },

  // Tạo chi tiết mèo mới
  async createCatDetail(catData: Omit<CatDetail, 'cat_id'>): Promise<CatDetail> {
    return apiService.post<CatDetail>(API_CONFIG.ENDPOINTS.CAT_DETAILS.CREATE, catData);
  }
};
