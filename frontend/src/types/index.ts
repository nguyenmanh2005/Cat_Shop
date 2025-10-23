// Frontend types - tương thích với backend API
export interface Role {
  role_id: number;
  role_name: string;
}

export interface User {
  user_id: number;
  username: string;
  password_hash: string;
  email: string;
  phone?: string;
  address?: string;
  role_id: number;
  role?: Role;
}

export interface ProductType {
  type_id: number;
  type_name: string;
}

export interface Category {
  category_id: number;
  category_name: string;
  description?: string;
  type_id: number;
  type?: ProductType;
}

export interface Product {
  product_id: number;
  product_name: string;
  type_id: number;
  category_id?: number;
  price: number;
  stock_quantity: number;
  description?: string;
  image_url?: string;
  type?: ProductType;
  category?: Category;
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
