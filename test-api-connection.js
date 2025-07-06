/**
 * Script test kết nối API
 * Kiểm tra xem backend có hoạt động không
 */

import axios from 'axios';

const API_URL = 'https://web-quiz-zone.onrender.com';

async function testApiConnection() {
  console.log('🔍 Testing API connection...');
  console.log('🌐 API URL:', API_URL);
  
  try {
    // Test health check endpoint
    console.log('\n1️⃣ Testing health check...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check successful:', healthResponse.data);
    
    // Test auth endpoint
    console.log('\n2️⃣ Testing auth endpoint...');
    const authResponse = await axios.get(`${API_URL}/api/auth`);
    console.log('✅ Auth endpoint accessible');
    
    // Test login endpoint (without credentials)
    console.log('\n3️⃣ Testing login endpoint...');
    try {
      await axios.post(`${API_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'test123'
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Login endpoint working (expected 401 for invalid credentials)');
      } else {
        console.log('❌ Login endpoint error:', error.message);
      }
    }
    
    console.log('\n🎉 API connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ API connection failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend server might be down or not accessible');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Check if the API URL is correct');
    } else if (error.response) {
      console.log('💡 Backend responded with status:', error.response.status);
    }
  }
}

// Chạy test
testApiConnection(); 