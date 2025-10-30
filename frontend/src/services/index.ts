// Export tất cả services
export { apiService, api } from './api';
export { authService } from './authService';
export { userService } from './userService';
export { productService, productTypeService, categoryService } from './productService';
export { orderService } from './orderService';
export { reviewService } from './reviewService';
export { catDetailService } from './catDetailService';
export { uploadService } from './uploadService';
export { foodDetailService } from './foodDetailService';
export { cageDetailService } from './cageDetailService';
export { cleaningDetailService } from './cleaningDetailService';
export { shipmentService } from './shipmentService';
export { paymentService } from './paymentService';
export { orderDetailService } from './orderDetailService';

// Export types
export type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  RefreshTokenRequest 
} from './authService';

