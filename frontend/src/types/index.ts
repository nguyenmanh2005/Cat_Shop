// Frontend types - tương thích với backend API (camelCase)
export interface Role {
  roleId: number;
  roleName: string;
}

export interface User {
  userId: number;
  username: string;
  passwordHash: string;
  email: string;
  phone?: string;
  address?: string;
  roleId: number;
  role?: Role;
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
  type?: ProductType;
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
  order_id: number;
  user_id: number;
  order_date: string;
  status: string;
  total_amount: number;
  user?: User;
}

export interface OrderDetail {
  order_detail_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Review {
  review_id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  user?: User;
}

export interface CatDetail {
  cat_id: number;
  breed: string;
  age: number;
  gender: string;
  vaccinated: boolean;
}

export interface FoodDetail {
  food_id: number;
  brand?: string;
  weight_kg?: number;
  ingredients?: string;
  expiry_date?: string;
  product?: Product;
}

export interface CageDetail {
  cage_id: number;
  material?: string;
  dimensions?: string;
  product?: Product;
}

export interface CleaningDetail {
  cleaning_id: number;
  volume_ml?: number;
  usage?: string;
  product?: Product;
}
