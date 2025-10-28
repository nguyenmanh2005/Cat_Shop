// Cấu hình API
export const API_CONFIG = {
  // URL của backend API Java Spring Boot
  // Sử dụng '/api' để proxy Vite chuyển hướng đến http://localhost:8080
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
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
      RESET_PASSWORD: '/auth/reset-password'
    },
    
    // Products
    PRODUCTS: {
      LIST: '/products',
      DETAIL: '/products/:id',
      CREATE: '/products',
      UPDATE: '/products/:id',
      DELETE: '/products/:id',
      SEARCH: '/products/search',
      BY_CATEGORY: '/products/category/:categoryId',
      FEATURED: '/products/featured'
    },
    
    // Categories
    CATEGORIES: {
      LIST: '/categories',
      DETAIL: '/categories/:id',
      CREATE: '/categories',
      UPDATE: '/categories/:id',
      DELETE: '/categories/:id',
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
      LIST: '/users',
      DETAIL: '/users/:id',
      CREATE: '/users',
      UPDATE: '/users/:id',
      DELETE: '/users/:id',
      PROFILE: '/users/profile',
      CHANGE_PASSWORD: '/users/change-password'
    },
    
    // Orders
    ORDERS: {
      LIST: '/orders',
      DETAIL: '/orders/:id',
      CREATE: '/orders',
      UPDATE: '/orders/:id',
      DELETE: '/orders/:id',
      USER_ORDERS: '/orders/user/:userId',
      UPDATE_STATUS: '/orders/:id/status'
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
      DETAIL: '/cat-details/:id',
      CREATE: '/cat-details',
      UPDATE: '/cat-details/:id',
      DELETE: '/cat-details/:id'
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

