// Frontend types - tương thích với backend API
export interface Role {
  roleId: number;
  roleName: string;
}

export interface User {
  userId: number;
  username: string;
  password?: string;
  email: string;
  phone?: string;
  address?: string;
  roleName?: string;
}

export interface ProductType {
  typeId: number;
  typeName: string;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
  typeId: number;
  typeName?: string;
}

export interface Product {
  productId: number;
  productName: string;
  typeId: number;
  categoryId?: number;
  price: number;
  stockQuantity: number;
  description?: string;
  imageUrl?: string;
  typeName?: string;
  categoryName?: string;
}

export interface Order {
  orderId: number;
  userId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  user?: User;
}

export interface OrderDetail {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Review {
  reviewId: number;
  userId: number;
  productId: number;
  rating: number;
  comment?: string;
  createdAt?: string;
  user?: User;
}

export interface CatDetail {
  productId: number;
  productName?: string;
  price?: number;
  stockQuantity?: number;
  imageUrl?: string;
  description?: string;
  breed: string;
  age: number;
  gender: string;
  vaccinated: boolean;
}

export interface FoodDetail {
  foodId: number;
  weightKg?: number;
  ingredients?: string;
  expiryDate?: string;
  product?: Product;
}

export interface CageDetail {
  productId: number;
  material?: string;
  dimensions?: string;
  product?: Product;
}

export interface CleaningDetail {
  productId: number;
  volumeMl?: number;
  usage?: string;
  product?: Product;
}

// New types for additional features
export interface Shipment {
  shipmentId: number;
  orderId: number;
  shippingAddress: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  order?: Order;
}

export interface Payment {
  paymentId: number;
  orderId: number;
  method: string;
  amount: number;
  status?: string;
  createdAt?: string;
  order?: Order;
}

// API Response types
export interface ApiResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  code: number;
  message: string;
  data: T;
  timestamp?: string;
}

export interface PaginatedResponse<T = any> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: any;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
}

// Search and filter types
export interface SearchParams {
  page?: number;
  size?: number;
  sort?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  typeId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProductSearchParams extends SearchParams {
  ingredients?: string;
  breed?: string;
  gender?: string;
  vaccinated?: boolean;
  material?: string;
  usage?: string;
  expiryBefore?: string;
}
