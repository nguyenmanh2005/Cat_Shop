// Script để test kết nối backend
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

async function testBackendConnection() {
  console.log('🔍 Testing Backend Connection...');
  console.log('API Base URL:', API_BASE_URL);
  
  try {
    // Test 1: Kiểm tra kết nối cơ bản
    console.log('\n1. Testing basic connection...');
    const response = await axios.get(`${API_BASE_URL}/products`, {
      timeout: 5000
    });
    console.log('✅ Basic connection successful');
    console.log('Status:', response.status);
    console.log('Data length:', response.data?.length || 'No data');
    
  } catch (error) {
    console.log('❌ Basic connection failed');
    console.log('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend is not running on port 8080');
      console.log('   Please start Spring Boot backend first');
    } else if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status Text:', error.response.statusText);
    }
  }

  try {
    // Test 2: Kiểm tra register endpoint
    console.log('\n2. Testing register endpoint...');
    const registerData = {
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'test123456',
      phone: '0123456789',
      address: 'Test Address'
    };
    
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, registerData, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Register endpoint working');
    console.log('Status:', registerResponse.status);
    console.log('Response:', registerResponse.data);
    
  } catch (error) {
    console.log('❌ Register endpoint failed');
    console.log('Error:', error.message);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status Text:', error.response.statusText);
      console.log('Response Data:', error.response.data);
      
      if (error.response.status === 404) {
        console.log('💡 Register endpoint not found - check controller mapping');
      } else if (error.response.status === 500) {
        console.log('💡 Server error - check database connection and logs');
      } else if (error.response.status === 400) {
        console.log('💡 Bad request - check data format and validation');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend is not running');
    }
  }

  try {
    // Test 3: Kiểm tra CORS
    console.log('\n3. Testing CORS...');
    const corsResponse = await axios.options(`${API_BASE_URL}/auth/register`, {
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('✅ CORS preflight successful');
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': corsResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': corsResponse.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': corsResponse.headers['access-control-allow-headers']
    });
    
  } catch (error) {
    console.log('❌ CORS preflight failed');
    console.log('Error:', error.message);
    console.log('💡 Check CORS configuration in Spring Boot');
  }
}

// Chạy test
testBackendConnection().catch(console.error);
