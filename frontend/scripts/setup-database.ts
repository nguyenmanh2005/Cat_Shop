import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function setupDatabase() {
  console.log("🔧 Thiết lập cơ sở dữ liệu CatShop...");
  
  // Thử các password phổ biến
  const commonPasswords = [
    "", // Không có password
    "postgres", 
    "admin",
    "password",
    "123456",
    "root"
  ];
  
  let workingConfig = null;
  
  for (const password of commonPasswords) {
    console.log(`\n🔍 Thử kết nối với password: "${password || 'không có'}"`);
    
    const testPool = new Pool({
      user: "postgres",
      host: "localhost",
      database: "postgres", // Kết nối đến database mặc định trước
      password: password,
      port: 5432,
    });
    
    try {
      const client = await testPool.connect();
      const result = await client.query("SELECT NOW() as current_time");
      client.release();
      await testPool.end();
      
      console.log("✅ Kết nối thành công!");
      workingConfig = { password };
      break;
    } catch (error) {
      console.log("❌ Kết nối thất bại");
      await testPool.end();
    }
  }
  
  if (!workingConfig) {
    console.log("\n❌ Không thể kết nối với PostgreSQL với bất kỳ password nào!");
    console.log("📋 Hướng dẫn thiết lập:");
    console.log("1. Đảm bảo PostgreSQL đang chạy");
    console.log("2. Kiểm tra password của user 'postgres'");
    console.log("3. Cập nhật file .env với password đúng");
    return;
  }
  
  console.log(`\n🎉 Tìm thấy cấu hình hoạt động với password: "${workingConfig.password || 'không có'}"`);
  
  // Cập nhật file .env
  const envContent = `# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shopmeo
DB_USER=postgres
DB_PASSWORD=${workingConfig.password}

# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=10000
VITE_NODE_ENV=development
VITE_CORS_ORIGIN=http://localhost:5173`;

  const fs = require('fs');
  fs.writeFileSync('.env', envContent);
  console.log("✅ Đã cập nhật file .env");
  
  // Tạo database shopmeo nếu chưa có
  const adminPool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: workingConfig.password,
    port: 5432,
  });
  
  try {
    console.log("\n🏗️  Đang tạo database 'shopmeo'...");
    await adminPool.query("CREATE DATABASE shopmeo");
    console.log("✅ Database 'shopmeo' đã được tạo!");
  } catch (error: any) {
    if (error.code === '42P04') {
      console.log("ℹ️  Database 'shopmeo' đã tồn tại");
    } else {
      console.log("❌ Lỗi tạo database:", error.message);
    }
  } finally {
    await adminPool.end();
  }
  
  console.log("\n🎉 Thiết lập hoàn tất! Bây giờ bạn có thể chạy 'npm run init-db'");
}

setupDatabase().catch(console.error);
