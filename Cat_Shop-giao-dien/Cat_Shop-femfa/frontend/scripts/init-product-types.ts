import pool from "../src/database/schema";

// Script để insert ProductTypes vào database
const insertProductTypesSQL = `
-- Xóa dữ liệu cũ nếu có (tùy chọn)
-- DELETE FROM product_types;

-- Insert ProductTypes
-- Lưu ý: Nếu bảng có unique constraint trên type_name, dùng ON CONFLICT (type_name)
-- Nếu có unique constraint trên type_id, dùng ON CONFLICT (type_id)
INSERT INTO product_types (type_id, type_name) VALUES
(1, 'Cat'),
(2, 'Food'),
(3, 'Cage'),
(4, 'Cleaning')
ON CONFLICT (type_name) DO UPDATE SET type_name = EXCLUDED.type_name;

-- Nếu muốn thêm Toy (type_id = 5)
-- INSERT INTO product_types (type_id, type_name) VALUES
-- (5, 'Toy')
-- ON CONFLICT (type_id) DO UPDATE SET type_name = EXCLUDED.type_name;
`;

async function initProductTypes() {
  console.log("🚀 Bắt đầu khởi tạo ProductTypes...");
  
  try {
    // Test kết nối
    console.log("\n📡 Đang kiểm tra kết nối database...");
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() as current_time");
    client.release();
    
    console.log("✅ Kết nối PostgreSQL thành công!");
    console.log("⏰ Thời gian hiện tại:", result.rows[0].current_time);

    // Kiểm tra xem bảng product_types có tồn tại không
    console.log("\n🔍 Đang kiểm tra bảng product_types...");
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'product_types'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log("⚠️  Bảng product_types chưa tồn tại. Đang tạo bảng...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS product_types (
          type_id SERIAL PRIMARY KEY,
          type_name VARCHAR(50) NOT NULL UNIQUE
        );
      `);
      console.log("✅ Bảng product_types đã được tạo!");
    } else {
      console.log("✅ Bảng product_types đã tồn tại!");
    }

    // Insert dữ liệu
    console.log("\n🌱 Đang thêm ProductTypes...");
    await pool.query(insertProductTypesSQL);
    console.log("✅ ProductTypes đã được thêm thành công!");

    // Kiểm tra dữ liệu đã insert
    const checkData = await pool.query("SELECT * FROM product_types ORDER BY type_id");
    console.log("\n📊 Danh sách ProductTypes trong database:");
    checkData.rows.forEach((row) => {
      console.log(`  - ID: ${row.type_id}, Name: ${row.type_name}`);
    });

    console.log("\n🎉 Khởi tạo ProductTypes hoàn tất!");
    
  } catch (error) {
    console.error("❌ Lỗi trong quá trình khởi tạo:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  initProductTypes().catch(console.error);
}

export { initProductTypes };

