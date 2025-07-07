/**
 * Script kiểm tra kết nối frontend-backend
 * Test xem frontend có đang sử dụng đúng backend URL không
 */

const https = require('https');

// URLs cần test
const URLs = {
  frontend: 'https://web-quiz-zone.vercel.app',
  backend: 'https://web-quiz-zone.onrender.com',
  backendHealth: 'https://web-quiz-zone.onrender.com/health'
};

/**
 * Test kết nối đến một URL
 */
function testURL(url, name) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing ${name}: ${url}`);
    
    const req = https.get(url, (res) => {
      console.log(`✅ ${name} - Status: ${res.statusCode} ${res.statusMessage}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (data) {
          // Tìm kiếm các URL backend trong response
          const backendUrls = data.match(/https:\/\/web-quiz-zone\.onrender\.com/g);
          const localhostUrls = data.match(/http:\/\/localhost:5000/g);
          const localhost3000Urls = data.match(/http:\/\/localhost:3000/g);
          
          if (backendUrls) {
            console.log(`   ✅ Found ${backendUrls.length} backend URLs in response`);
          }
          
          if (localhostUrls) {
            console.log(`   ⚠️  Found ${localhostUrls.length} localhost:5000 URLs in response`);
          }
          
          if (localhost3000Urls) {
            console.log(`   ⚠️  Found ${localhost3000Urls.length} localhost:3000 URLs in response`);
          }
          
          // Hiển thị một phần response để kiểm tra
          console.log(`   Response preview: ${data.substring(0, 300)}...`);
        }
        resolve({ success: true, status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${name} - Error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ ${name} - Timeout after 10 seconds`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

/**
 * Test API call từ frontend perspective
 */
async function testFrontendBackendConnection() {
  console.log('🚀 Testing Frontend-Backend Connection...\n');
  console.log('='.repeat(60));
  
  // Test 1: Kiểm tra frontend có load được không
  console.log('\n1️⃣ Testing Frontend Load');
  const frontendResult = await testURL(URLs.frontend, 'Frontend (Vercel)');
  
  // Test 2: Kiểm tra backend health
  console.log('\n2️⃣ Testing Backend Health');
  const backendHealthResult = await testURL(URLs.backendHealth, 'Backend Health');
  
  // Test 3: Test API endpoint mà frontend sẽ gọi
  console.log('\n3️⃣ Testing Backend API Endpoint');
  const backendApiResult = await testURL(URLs.backend + '/api/auth/login', 'Backend API');
  
  // Summary
  console.log('\n📊 Connection Analysis:');
  console.log('='.repeat(60));
  
  if (frontendResult.success && backendHealthResult.success) {
    console.log('✅ Frontend and Backend are both accessible');
    console.log('✅ Backend is healthy and responding');
    
    if (backendApiResult.success) {
      console.log('✅ Backend API endpoints are working');
    } else {
      console.log('⚠️  Backend API endpoints may have issues');
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Open browser and go to: https://web-quiz-zone.vercel.app');
    console.log('2. Open Developer Tools (F12)');
    console.log('3. Go to Network tab');
    console.log('4. Try to login and check API calls');
    console.log('5. Look for calls to: https://web-quiz-zone.onrender.com');
    
  } else {
    console.log('❌ Some services are not accessible');
    console.log('🔧 Check deployment configurations');
  }
  
  console.log('\n💡 Manual Verification Steps:');
  console.log('='.repeat(60));
  console.log('1. Visit: https://web-quiz-zone.vercel.app');
  console.log('2. Press F12 to open Developer Tools');
  console.log('3. Go to Console tab');
  console.log('4. Look for any error messages');
  console.log('5. Go to Network tab');
  console.log('6. Try to login and watch API calls');
  console.log('7. Check if calls go to: https://web-quiz-zone.onrender.com');
}

// Run test
testFrontendBackendConnection().catch(console.error); 