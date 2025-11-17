// Cấu hình API
export const API_CONFIG = {
  // URL của backend API Java Spring Boot
  // Development: dùng relative path để đi qua Vite proxy (tránh CORS)
  // Production: dùng absolute URL từ environment variable
  BASE_URL: import.meta.env.DEV
    ? '/api'  // Dev mode: dùng proxy của Vite
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'), // Production: dùng absolute URL
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  
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
      // OTP Login
      SEND_OTP: '/auth/send-otp',
      VERIFY_OTP: '/auth/verify-otp',
      // MFA (Google Authenticator)
      MFA_VERIFY: '/auth/mfa/verify',
      // QR Code Login
      GENERATE_QR: '/auth/generate-qr',
      VERIFY_QR: '/auth/verify-qr'
    },
    
    // Products
    PRODUCTS: {
      LIST: '/customer/products',
      DETAIL: '/customer/products/:id',
      CREATE: '/admin/products',
      UPDATE: '/admin/products/:id',
      DELETE: '/admin/products/:id',
      SEARCH: '/customer/products/search',
      BY_CATEGORY: '/customer/products/category/:categoryId',
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
      PROFILE: '/users/profile',
      CHANGE_PASSWORD: '/users/change-password'
    },
    
    // Orders
    ORDERS: {
      LIST: '/orders/admin/all',
      DETAIL: '/orders/:id',
      CREATE: '/orders',
      UPDATE: '/orders/:id',
      DELETE: '/orders/:id',
      USER_ORDERS: '/orders/user/:userId',
      UPDATE_STATUS: '/orders/:id'
    },
    
    // Order Items
    ORDER_ITEMS: {
      LIST: '/order-items',
      CREATE: '/order-items',
      UPDATE: '/order-items/:id',
      DELETE: '/order-items/:id'
    },
    
    // Reviews
    REVIEWS: {
      LIST: '/reviews',
      CREATE: '/reviews',
      UPDATE: '/reviews/:id',
      DELETE: '/reviews/:id',
      PRODUCT_REVIEWS: '/reviews/product/:productId',
      USER_REVIEWS: '/reviews/user/:userId'
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
    
    // File Upload
    UPLOAD: {
      IMAGE: '/upload/image',
      MULTIPLE: '/upload/multiple'
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

