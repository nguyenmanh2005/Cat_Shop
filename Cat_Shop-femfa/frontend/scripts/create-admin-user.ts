import bcrypt from 'bcrypt';
import { Pool } from 'pg';

// Cấu hình database
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'catshop',
  password: '123456',
  port: 5432,
});

async function createAdminUser() {
  console.log(' Tạo tài khoản admin mặc định...');
  
  try {
    // Kết nối database
    await pool.connect();
    console.log('✅ Kết nối database thành công');

    // Hash mật khẩu
    const password = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('🔒 Mật khẩu đã được hash');

    // Kiểm tra xem admin đã tồn tại chưa
    const checkQuery = 'SELECT user_id FROM Users WHERE email = $1 OR username = $2';
    const checkResult = await pool.query(checkQuery, ['admin@catshop.com', 'admin']);
    
    if (checkResult.rows.length > 0) {
      console.log('⚠️  Tài khoản admin đã tồn tại');
      
      // Cập nhật mật khẩu admin hiện tại
      const updateQuery = `
        UPDATE Users 
        SET password_hash = $1, 
            username = $2, 
            email = $3, 
            phone = $4, 
            address = $5,
            role_id = 1
        WHERE email = $3 OR username = $2
      `;
      
      await pool.query(updateQuery, [
        hashedPassword,
        'admin',
        'admin@catshop.com',
        '0123456789',
        '123 Admin Street, Ho Chi Minh City'
      ]);
      
      console.log('✅ Cập nhật tài khoản admin thành công');
    } else {
      // Tạo tài khoản admin mới
      const insertQuery = `
        INSERT INTO Users (username, password_hash, email, phone, address, role_id)
        VALUES ($1, $2, $3, $4, $5, 1)
        RETURNING user_id
      `;
      
      const result = await pool.query(insertQuery, [
        'admin',
        hashedPassword,
        'admin@catshop.com',
        '0123456789',
        '123 Admin Street, Ho Chi Minh City'
      ]);
      
      console.log('✅ Tạo tài khoản admin thành công');
      console.log('📋 User ID:', result.rows[0].user_id);
    }

    // Hiển thị thông tin tài khoản
    console.log('\n🎉 TÀI KHOẢN ADMIN ĐÃ ĐƯỢC TẠO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Username: admin');
    console.log('📧 Email: admin@catshop.com');
    console.log('🔑 Password: admin123');
    console.log('📱 Phone: 0123456789');
    console.log('🏠 Address: 123 Admin Street, Ho Chi Minh City');
    console.log('👑 Role: Admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n💡 Hướng dẫn sử dụng:');
    console.log('1. Khởi động backend Spring Boot');
    console.log('2. Khởi động frontend React');
    console.log('3. Đăng nhập với thông tin trên');
    console.log('4. Truy cập Admin Panel tại /admin');

  } catch (error) {
    console.error('❌ Lỗi khi tạo tài khoản admin:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Database chưa chạy. Hãy:');
      console.log('1. Khởi động PostgreSQL');
      console.log('2. Tạo database "catshop"');
      console.log('3. Chạy lại script này');
    } else if (error.code === '42P01') {
      console.log('\n💡 Table Users chưa tồn tại. Hãy:');
      console.log('1. Chạy: npm run init-db');
      console.log('2. Chạy lại script này');
    }
  } finally {
    await pool.end();
  }
}

// Chạy script
createAdminUser().catch(console.error);
