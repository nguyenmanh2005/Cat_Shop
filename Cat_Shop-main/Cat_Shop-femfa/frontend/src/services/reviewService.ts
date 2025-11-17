import { apiService } from './api';
import { API_CONFIG, buildUrl } from '@/config/api';
import { Review } from '@/types';

// Review Service
export const reviewService = {
  // Lấy đánh giá theo sản phẩm
  async getReviewsByProduct(productId: number): Promise<Review[]> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.REVIEWS.PRODUCT_REVIEWS, { productId });
    return apiService.get<Review[]>(url);
  },

  // Lấy tất cả đánh giá
  async getAllReviews(): Promise<Review[]> {
    return apiService.get<Review[]>(API_CONFIG.ENDPOINTS.REVIEWS.LIST);
  },

  // Tạo đánh giá mới
  async createReview(reviewData: Omit<Review, 'review_id' | 'created_at'>): Promise<Review> {
    return apiService.post<Review>(API_CONFIG.ENDPOINTS.REVIEWS.CREATE, reviewData);
  }
};
