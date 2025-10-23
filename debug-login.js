// Script debug đăng nhập admin
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

async function debugLogin() {
  console.log(' Debug đăng nhập admin...');
  console.log('API Base URL:', API_BASE_URL);
  
  const adminCredentials = {
    email: 'admin@catshop.com',
    password: 'admin123'
  };

  try {
    // Test 1: Kiểm tra kết nối backend
    console.log('\n1. Kiểm tra kết nối backend...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/products`, {
        timeout: 5000
      });
      console.log(' Backend đang chạy');
      console.log('Status:', healthResponse.status);
    } catch (error) {
      console.log(' Backend không chạy hoặc không thể kết nối');
      console.log('Error:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.log(' Hãy đảm bảo Spring Boot đang chạy trên port 8080');
      }
      return;
    }

    // Test 2: Kiểm tra endpoint đăng nhập
    console.log('\n2. Kiểm tra endpoint đăng nhập...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, adminCredentials, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(' Endpoint đăng nhập hoạt động');
      console.log('Status:', loginResponse.status);
      console.log('Response:', loginResponse.data);
      
    } catch (error) {
      console.log(' Lỗi đăng nhập');
      console.log('Error:', error.message);
      
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Status Text:', error.response.statusText);
        console.log('Response Data:', error.response.data);
        
        if (error.response.status === 404) {
          console.log('💡 Endpoint /auth/login không tồn tại');
          console.log('   Kiểm tra controller mapping trong Spring Boot');
        } else if (error.response.status === 401) {
          console.log('💡 Sai thông tin đăng nhập hoặc tài khoản không tồn tại');
          console.log('   Kiểm tra database có tài khoản admin không');
        } else if (error.response.status === 500) {
          console.log('💡 Lỗi server - kiểm tra logs Spring Boot');
        }
      }
    }

    // Test 3: Kiểm tra database có tài khoản admin không
    console.log('\n3. Kiểm tra tài khoản admin trong database...');
    try {
      // Thử các endpoint khác để kiểm tra database
      const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
        timeout: 5000
      });
      
      console.log('✅ Endpoint users hoạt động');
      console.log('Users count:', usersResponse.data?.length || 'Unknown');
      
      // Tìm admin user
      const adminUser = usersResponse.data?.find(user => 
        user.email === 'admin@catshop.com' || user.username === 'admin'
      );
      
      if (adminUser) {
        console.log('✅ Tìm thấy tài khoản admin trong database');
        console.log('Admin user:', {
          id: adminUser.user_id || adminUser.id,
          username: adminUser.username,
          email: adminUser.email,
          role: adminUser.role_id || adminUser.role
        });
      } else {
        console.log('❌ Không tìm thấy tài khoản admin trong database');
        console.log('💡 Hãy chạy: npm run create-admin');
      }
      
    } catch (error) {
      console.log('❌ Không thể kiểm tra database');
      console.log('Error:', error.message);
    }

    // Test 4: Kiểm tra CORS
    console.log('\n4. Kiểm tra CORS...');
    try {
      const corsResponse = await axios.options(`${API_BASE_URL}/auth/login`, {
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      console.log('✅ CORS preflight thành công');
      console.log('CORS Headers:', {
        'Access-Control-Allow-Origin': corsResponse.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': corsResponse.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': corsResponse.headers['access-control-allow-headers']
      });
      
    } catch (error) {
      console.log('❌ CORS preflight thất bại');
      console.log('Error:', error.message);
      console.log('💡 Kiểm tra cấu hình CORS trong Spring Boot');
    }

  } catch (error) {
    console.error('❌ Lỗi không xác định:', error);
  }
}

// Chạy debug
debugLogin().catch(console.error);
