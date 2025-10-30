// Cấu hình API
export const API_CONFIG = {
  // URL của backend API Java Spring Boot - thay đổi theo server của bạn T
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api',
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
      LIST: '/customer/products',
      DETAIL: '/customer/products/:id',
      CREATE: '/admin/products',
      UPDATE: '/admin/products/:id',
      DELETE: '/admin/products/:id',
      SEARCH: '/customer/products/search',
      BY_CATEGORY: '/customer/products/category/:categoryId',
      BY_TYPE: '/customer/products/type/:typeId',
      PRICE_RANGE: '/customer/products/price-range'
    },
    
    // Categories
    CATEGORIES: {
      LIST: '/categories/customer',
      ADMIN_LIST: '/categories/admin',
      DETAIL: '/categories/:id',
      CREATE: '/categories/admin',
      UPDATE: '/categories/admin/:id',
      DELETE: '/categories/admin/:id',
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
      USER_ORDERS_BY_STATUS: '/orders/user/:userId/status/:status',
      USER_MONTHLY_SPENDING: '/orders/user/:userId/monthly-spending',
      ADMIN_ALL: '/orders/admin/all',
      ADMIN_STATUS_COUNT: '/orders/admin/status-count',
      ADMIN_MONTHLY_REVENUE: '/orders/admin/monthly-revenue',
      UPDATE_STATUS: '/orders/:id/status'
    },
    
    // Order Details
    ORDER_DETAILS: {
      LIST: '/order-details',
      DETAIL: '/order-details/:id',
      CREATE: '/order-details',
      UPDATE: '/order-details/:id',
      DELETE: '/order-details/:id',
      BY_ORDER: '/order-details/order/:orderId',
      BY_PRODUCT: '/order-details/product/:productId',
      ORDER_TOTAL: '/order-details/order/:orderId/total',
      ADMIN_REVENUE: '/order-details/admin/revenue'
    },
    
    // Reviews
    REVIEWS: {
      LIST: '/reviews',
      CREATE: '/reviews',
      UPDATE: '/reviews/:id',
      DELETE: '/reviews/:id',
      PRODUCT_REVIEWS: '/reviews/product/:productId',
      USER_REVIEWS: '/reviews/user/:userId',
      PRODUCT_AVERAGE: '/reviews/product/:productId/average',
      PRODUCT_COUNT: '/reviews/product/:productId/count',
      ADMIN_ALL: '/reviews/admin/all',
      ADMIN_LOW: '/reviews/admin/low',
      ADMIN_HIGH: '/reviews/admin/high',
      ADMIN_SEARCH: '/reviews/admin/search'
    },
    
    // Cat Details
    CAT_DETAILS: {
      LIST: '/cat-details',
      DETAIL: '/cat-details/:id',
      CREATE: '/admin/cat-details',
      UPDATE: '/admin/cat-details/:id',
      DELETE: '/admin/cat-details/:id',
      ADMIN_LIST: '/admin/cat-details',
      SEARCH_BREED: '/cat-details/search',
      FILTER_GENDER: '/cat-details/filter/gender',
      FILTER_VACCINATED: '/cat-details/filter/vaccinated'
    },
    
    // Food Details
    FOOD_DETAILS: {
      LIST: '/food-details',
      DETAIL: '/food-details/:id',
      CREATE: '/admin/food-details',
      UPDATE: '/admin/food-details/:id',
      DELETE: '/admin/food-details/:id',
      ADMIN_LIST: '/admin/food-details',
      SEARCH_INGREDIENTS: '/admin/food-details/search',
      FILTER_EXPIRY: '/admin/food-details/filter',
      SEARCH_FILTER: '/admin/food-details/search-filter',
      CUSTOMER_SEARCH: '/food-details/search'
    },
    
    // Cage Details
    CAGE_DETAILS: {
      LIST: '/customer/cage-details',
      DETAIL: '/customer/cage-details/:id',
      CREATE: '/admin/cage-details',
      UPDATE: '/admin/cage-details/:id',
      DELETE: '/admin/cage-details/:id',
      ADMIN_LIST: '/admin/cage-details',
      ADMIN_DETAIL: '/admin/cage-details/:id',
      ADMIN_SEARCH: '/admin/cage-details',
      CUSTOMER_SEARCH: '/customer/cage-details'
    },
    
    // Cleaning Details
    CLEANING_DETAILS: {
      LIST: '/customer/cleaning-details',
      DETAIL: '/customer/cleaning-details/:id',
      CREATE: '/admin/cleaning-details',
      UPDATE: '/admin/cleaning-details/:id',
      DELETE: '/admin/cleaning-details/:id',
      ADMIN_LIST: '/admin/cleaning-details',
      ADMIN_DETAIL: '/admin/cleaning-details/:id',
      ADMIN_SEARCH: '/admin/cleaning-details/search',
      CUSTOMER_SEARCH: '/customer/cleaning-details/search'
    },
    
    // Shipments
    SHIPMENTS: {
      ADMIN_ALL: '/shipments/admin/all',
      ADMIN_STATUS: '/shipments/admin/status/:status',
      ADMIN_ADDRESS: '/shipments/admin/address',
      ADMIN_DATE_RANGE: '/shipments/admin/date-range',
      ADMIN_COUNT_BY_STATUS: '/shipments/admin/count-by-status',
      ADMIN_BY_ORDER: '/shipments/admin/order/:orderId',
      ADMIN_BY_USER: '/shipments/admin/user/:userId',
      ADMIN_COUNT_MONTH: '/shipments/admin/count-month',
      ADMIN_CREATE: '/shipments/admin/create',
      ADMIN_UPDATE: '/shipments/admin/update/:id',
      ADMIN_DELETE: '/shipments/admin/delete/:id',
      USER_ALL: '/shipments/user/:userId/all',
      USER_STATUS: '/shipments/user/:userId/status/:status',
      USER_DATE_RANGE: '/shipments/user/:userId/date-range',
      USER_DETAIL: '/shipments/user/:userId/detail/:shipmentId'
    },
    
    // Payments
    PAYMENTS: {
      LIST: '/payments/all',
      CREATE: '/payments',
      UPDATE: '/payments/:id',
      DELETE: '/payments/:id',
      BY_ORDER: '/payments/order/:orderId',
      BY_USER: '/payments/user/:userId',
      BY_METHOD: '/payments/method/:method',
      BY_DATE_RANGE: '/payments/date-range',
      BY_MIN_AMOUNT: '/payments/min-amount',
      STATS_TOTAL: '/payments/stats/total',
      STATS_USER_TOTAL: '/payments/stats/total/user/:userId',
      STATS_METHOD_SUMMARY: '/payments/stats/method-summary',
      USER_ALL: '/payments/user/:userId/all',
      USER_METHOD: '/payments/user/:userId/method/:method',
      USER_DATE_RANGE: '/payments/user/:userId/date-range'
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

