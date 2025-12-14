// Cấu hình API
export const API_CONFIG = {
  // URL của backend API Java Spring Boot
  // Development: dùng relative path để đi qua Vite proxy (tránh CORS)
  // Production: dùng absolute URL từ environment variable
  BASE_URL: import.meta.env.DEV
    ? '/api'  // Dev mode: dùng proxy của Vite
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'), // Production: dùng absolute URL
  // Tăng timeout lên 10 phút (600000 ms) nếu không cấu hình env
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '600000'),
  
  // Endpoints - Spring Boot REST API
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      PROFILE: '/auth/profile',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      // OTP Login (cho user đã có tài khoản)
      SEND_OTP: '/auth/send-otp',
      VERIFY_OTP: '/auth/verify-otp',
      // OTP Register (cho user mới đăng ký)
      REGISTER_SEND_OTP: '/auth/register/send-otp',
      REGISTER_VERIFY_OTP: '/auth/register/verify-otp',
      // SMS OTP Login
      SEND_SMS_OTP: '/auth/send-sms-otp',
      VERIFY_SMS_OTP: '/auth/verify-sms-otp',
      // MFA (Google Authenticator)
      MFA_VERIFY: '/auth/mfa/verify',
      // QR Code Login
      GENERATE_QR: '/auth/qr/generate',
      QR_STATUS: '/auth/qr/status/:sessionId',
      // Device Management
      DEVICES: '/auth/devices',
      DEVICE_DELETE: '/auth/devices/:deviceId',
      DEVICES_DELETE_ALL: '/auth/devices/all'
    },
    
    // Products
    PRODUCTS: {
      LIST: '/customer/products',
      DETAIL: '/customer/products/:id',
      CREATE: '/admin/products', // Cần gửi multipart/form-data với 'product' (JSON) và 'file' (MultipartFile)
      UPDATE: '/admin/products/:id', // Cũng cần multipart/form-data
      DELETE: '/admin/products/:id',
      SEARCH: '/customer/products/search',
      BY_CATEGORY: '/customer/products/category/:categoryId',
      BY_TYPE: '/customer/products/type/:typeId',
      BY_PRICE_RANGE: '/customer/products/price-range',
      FEATURED: '/customer/products'
    },
    
    // Categories
    CATEGORIES: {
      LIST: '/categories/customer', // Backend có /api/categories/customer (GET)
      LIST_ADMIN: '/categories/admin', // Backend có /api/categories/admin (GET)
      DETAIL: '/categories/:id',
      CREATE: '/categories/admin', // Backend có POST /api/categories/admin
      UPDATE: '/categories/admin/:id', // Backend có PUT /api/categories/admin/:id
      DELETE: '/categories/admin/:id', // Backend có DELETE /api/categories/admin/:id
      WITH_PRODUCTS: '/categories/:id/products'
    },
    
    // Product Types
    PRODUCT_TYPES: {
      LIST: '/product-types',
      DETAIL: '/product-types/:id',
      CREATE: '/product-types',
      UPDATE: '/product-types/:id',
      DELETE: '/product-types/:id'
    },
    
    // Users
    USERS: {
      LIST: '/users/getAll',
      DETAIL: '/users/:id',
      CREATE: '/users',
      UPDATE: '/users/:id',
      DELETE: '/users/:id',
      // PROFILE và CHANGE_PASSWORD không tồn tại trong backend
      // Sử dụng GET /users/email/{email} để lấy profile
    },
    
    // Orders
    ORDERS: {
      LIST: '/orders/admin/all',
      // DETAIL: '/orders/:id' - Backend không có endpoint này, cần lấy qua USER_ORDERS hoặc LIST
      CREATE: '/orders',
      UPDATE: '/orders/:orderId',
      DELETE: '/orders/:orderId',
      USER_ORDERS: '/orders/user/:userId',
      USER_ORDERS_BY_EMAIL: '/orders/user/email/:email'
    },
    
    // Order Items (Order Details)
    ORDER_ITEMS: {
      LIST: '/order-details', // Backend có endpoint này
      DETAIL: '/order-details/:id',
      BY_ORDER: '/order-details/order/:orderId', // Lấy order details theo orderId
      BY_PRODUCT: '/order-details/product/:productId',
      CREATE: '/order-details',
      UPDATE: '/order-details/:id',
      DELETE: '/order-details/:id'
    },
    
    // Reviews
    REVIEWS: {
      LIST: '/reviews/admin/all', // Sửa từ '/reviews' (không tồn tại)
      CREATE: '/reviews',
      UPDATE: '/reviews/:reviewId',
      DELETE: '/reviews/:reviewId',
      DETAIL: '/reviews/:reviewId',
      PRODUCT_REVIEWS: '/reviews/product/:productId',
      USER_REVIEWS: '/reviews/user/:userId',
      PRODUCT_AVERAGE: '/reviews/product/:productId/average',
      PRODUCT_COUNT: '/reviews/product/:productId/count'
    },
    
    // Cat Details
    CAT_DETAILS: {
      LIST: '/cat-details',
      LIST_ADMIN: '/admin/cat-details',
      DETAIL: '/cat-details/:id',
      DETAIL_ADMIN: '/admin/cat-details/:id',
      CREATE: '/admin/cat-details',
      UPDATE: '/admin/cat-details/:id',
      DELETE: '/admin/cat-details/:id'
    },
    
    // File Upload - Backend không có UploadController riêng
    // Upload được xử lý trực tiếp trong ProductController với multipart/form-data
    // Nếu cần upload riêng, tạo UploadController trong backend
    UPLOAD: {
      // IMAGE: '/upload/image', // ❌ Không tồn tại
      // MULTIPLE: '/upload/multiple' // ❌ Không tồn tại
      // Upload product: POST /api/admin/products với multipart/form-data
    }
  }
};

// Helper function để build URL với parameters
export const buildUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = endpoint;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  
  return url;
};

