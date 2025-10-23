import { testConnection, closeConnection } from "./db";

async function main() {
  console.log("🔍 Đang kiểm tra kết nối PostgreSQL...");
  
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log("\n🎉 Kết nối thành công! Bạn có thể bắt đầu sử dụng database.");
  } else {
    console.log("\n❌ Kết nối thất bại. Vui lòng kiểm tra:");
    console.log("1. PostgreSQL đã được cài đặt và chạy");
    console.log("2. Database 'shopmeo' đã được tạo");
    console.log("3. Thông tin kết nối trong file .env đúng");
    console.log("4. Username và password chính xác");
  }
  
  await closeConnection();
}

main().catch(console.error);












