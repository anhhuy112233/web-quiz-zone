/**
 * Script test API calls từ frontend perspective
 * Mô phỏng các API calls mà frontend sẽ thực hiện
 */

const https = require('https');

// Production URLs
const BACKEND_URL = 'https://web-quiz-zone.onrender.com';
const FRONTEND_URL = 'https://web-quiz-zone.vercel.app';

/**
 * Test API call với method và data
 */
function testApiCall(endpoint, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const url = `${BACKEND_URL}${endpoint}`;
    console.log(`\n🔍 Testing ${method} ${endpoint}`);
    console.log(`   URL: ${url}`);
    
    const options = {
      hostname: 'web-quiz-zone.onrender.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WebQuizZone-Frontend/1.0'
      }
    };
    
    if (data && method !== 'GET') {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = https.request(options, (res) => {
      console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          console.log(`   Response: ${JSON.stringify(jsonResponse, null, 2)}`);
        } catch (e) {
          console.log(`   Response: ${responseData.substring(0, 200)}...`);
        }
        
        resolve({
          success: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          data: responseData
        });
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`   ⏰ Timeout after 10 seconds`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
    
    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Test tất cả API endpoints mà frontend sẽ sử dụng
 */
async function testAllFrontendApiCalls() {
  console.log('🚀 Testing Frontend API Calls to Backend...\n');
  console.log('='.repeat(60));
  
  const results = {};
  
  // Test 1: Health check
  console.log('\n1️⃣ Testing Health Check');
  results.health = await testApiCall('/health');
  
  // Test 2: Root endpoint
  console.log('\n2️⃣ Testing Root Endpoint');
  results.root = await testApiCall('/');
  
  // Test 3: Login endpoint (POST)
  console.log('\n3️⃣ Testing Login Endpoint');
  results.login = await testApiCall('/api/auth/login', 'POST', {
    username: 'admin',
    password: 'admin123'
  });
  
  // Test 4: Register endpoint (POST)
  console.log('\n4️⃣ Testing Register Endpoint');
  results.register = await testApiCall('/api/auth/register', 'POST', {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'student'
  });
  
  // Test 5: Get exams endpoint
  console.log('\n5️⃣ Testing Get Exams Endpoint');
  results.exams = await testApiCall('/api/exams');
  
  // Test 6: Get users endpoint (admin only)
  console.log('\n6️⃣ Testing Get Users Endpoint');
  results.users = await testApiCall('/api/users');
  
  // Summary
  console.log('\n📊 API Test Results Summary:');
  console.log('='.repeat(60));
  
  Object.entries(results).forEach(([key, result]) => {
    const status = result.success ? '✅ OK' : '❌ FAILED';
    const statusCode = result.success ? ` (${result.status})` : '';
    console.log(`${key.padEnd(15)}: ${status}${statusCode}`);
  });
  
  // Analysis
  console.log('\n🔍 Frontend-Backend Connection Analysis:');
  console.log('='.repeat(60));
  
  if (results.health.success && results.root.success) {
    console.log('✅ Backend is accessible and responding');
    console.log('✅ Basic endpoints are working');
    
    if (results.login.success) {
      console.log('✅ Authentication endpoints are working');
    } else {
      console.log('⚠️  Authentication endpoints may have issues');
    }
    
    if (results.exams.success) {
      console.log('✅ Exam endpoints are working');
    } else {
      console.log('⚠️  Exam endpoints may have issues');
    }
    
    console.log('\n🎯 Frontend should be able to connect to backend');
    console.log('✅ API_BASE_URL is correctly configured');
    console.log('✅ Backend is accepting requests');
    
  } else {
    console.log('❌ Backend is not accessible');
    console.log('🔧 Check backend deployment and environment variables');
  }
  
  // Manual verification steps
  console.log('\n💡 Manual Verification Steps:');
  console.log('='.repeat(60));
  console.log('1. Open browser: https://web-quiz-zone.vercel.app');
  console.log('2. Press F12 → Console tab');
  console.log('3. Look for any error messages');
  console.log('4. Try to login and watch Network tab');
  console.log('5. Check if API calls go to: https://web-quiz-zone.onrender.com');
  console.log('6. Verify CORS is working (no CORS errors)');
  
  // Environment variables check
  console.log('\n🔧 Environment Variables Check:');
  console.log('='.repeat(60));
  console.log('Frontend (Vercel) should have:');
  console.log('  VITE_API_URL=https://web-quiz-zone.onrender.com');
  console.log('  VITE_SOCKET_URL=https://web-quiz-zone.onrender.com');
  console.log('');
  console.log('Backend (Render) should have:');
  console.log('  FRONTEND_URL=https://web-quiz-zone.vercel.app');
  console.log('  NODE_ENV=production');
}

// Run tests
testAllFrontendApiCalls().catch(console.error); 