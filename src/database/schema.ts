import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Cấu hình kết nối PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost", 
  database: process.env.DB_NAME || "shopmeo",
  password: process.env.DB_PASSWORD || "postgres", // Đặt password mặc định
  port: parseInt(process.env.DB_PORT || "5432"),
});

// Định nghĩa các interface cho database
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

export interface CatDetail {
  cat_id: number;
  breed?: string;
  age?: number;
  gender?: string;
  vaccinated: boolean;
  product?: Product;
}

export interface FoodDetail {
  food_id: number;
  weight_kg?: number;
  ingredients?: string;
  expiry_date?: Date;
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

export interface Order {
  order_id: number;
  user_id: number;
  order_date: Date;
  status: string;
  total_amount: number;
  user?: User;
  order_details?: OrderDetail[];
  payment?: Payment;
  shipment?: Shipment;
}

export interface OrderDetail {
  order_detail_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Payment {
  payment_id: number;
  order_id: number;
  payment_date: Date;
  method?: string;
  amount: number;
}

export interface Shipment {
  shipment_id: number;
  order_id: number;
  shipping_address?: string;
  shipped_date?: Date;
  status?: string;
}

export interface Review {
  review_id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment?: string;
  created_at: Date;
  user?: User;
  product?: Product;
}

// Hàm test kết nối
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() as current_time, version() as postgres_version");
    client.release();
    
    console.log("✅ Kết nối PostgreSQL thành công!");
    console.log("⏰ Thời gian hiện tại:", result.rows[0].current_time);
    console.log("📊 Phiên bản PostgreSQL:", result.rows[0].postgres_version);
    return true;
  } catch (error) {
    console.error("❌ Lỗi kết nối PostgreSQL:", error);
    return false;
  }
}

// Hàm đóng kết nối
export async function closeConnection() {
  await pool.end();
}

export default pool;












