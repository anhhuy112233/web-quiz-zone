/**
 * Script test production connection sau khi fix
 */

const https = require('https');

// Production URLs
const PRODUCTION_URLS = {
  frontend: 'https://web-quiz-zone.vercel.app',
  backend: 'https://web-quiz-zone.onrender.com',
  backendHealth: 'https://web-quiz-zone.onrender.com/health',
  backendAuth: 'https://web-quiz-zone.onrender.com/api/auth/login'
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
          try {
            const jsonData = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(jsonData, null, 2)}`);
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 200)}...`);
          }
        }
        resolve({ success: true, status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${name} - Error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(15000, () => {
      console.log(`⏰ ${name} - Timeout after 15 seconds`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

/**
 * Test API call với POST method
 */
function testPostAPI(url, data, name) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing POST ${name}: ${url}`);
    
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'web-quiz-zone.onrender.com',
      port: 443,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
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
    
    req.setTimeout(15000, () => {
      console.log(`   ⏰ Timeout after 15 seconds`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
    
    req.write(postData);
    req.end();
  });
}

/**
 * Test tất cả services
 */
async function testProductionFix() {
  console.log('🚀 Testing Production Fix...\n');
  console.log('='.repeat(60));
  
  const results = {};
  
  // Test 1: Frontend
  console.log('\n1️⃣ Testing Frontend (Vercel)');
  results.frontend = await testURL(PRODUCTION_URLS.frontend, 'Frontend');
  
  // Test 2: Backend health
  console.log('\n2️⃣ Testing Backend Health');
  results.backendHealth = await testURL(PRODUCTION_URLS.backendHealth, 'Backend Health');
  
  // Test 3: Backend auth endpoint (GET)
  console.log('\n3️⃣ Testing Backend Auth Endpoint (GET)');
  results.backendAuthGet = await testURL(PRODUCTION_URLS.backendAuth, 'Backend Auth GET');
  
  // Test 4: Backend auth endpoint (POST)
  console.log('\n4️⃣ Testing Backend Auth Endpoint (POST)');
  results.backendAuthPost = await testPostAPI(PRODUCTION_URLS.backendAuth, {
    email: 'admin@webquizzone.com',
    password: 'admin123'
  }, 'Backend Auth POST');
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(60));
  
  Object.entries(results).forEach(([key, result]) => {
    const status = result.success ? '✅ OK' : '❌ FAILED';
    const statusCode = result.success ? ` (${result.status})` : '';
    console.log(`${key.padEnd(20)}: ${status}${statusCode}`);
  });
  
  // Analysis
  console.log('\n🔍 Analysis:');
  console.log('='.repeat(60));
  
  if (results.frontend.success) {
    console.log('✅ Frontend is accessible');
  } else {
    console.log('❌ Frontend has issues');
  }
  
  if (results.backendHealth.success) {
    console.log('✅ Backend is healthy and responding');
  } else {
    console.log('❌ Backend health check failed');
  }
  
  if (results.backendAuthGet.success) {
    console.log('✅ Backend auth endpoint is accessible');
  } else {
    console.log('❌ Backend auth endpoint failed');
  }
  
  if (results.backendAuthPost.success) {
    console.log('✅ Backend auth POST is working');
  } else {
    console.log('⚠️  Backend auth POST may have issues (expected for invalid credentials)');
  }
  
  // Next steps
  console.log('\n🎯 Next Steps:');
  console.log('='.repeat(60));
  
  if (results.frontend.success && results.backendHealth.success) {
    console.log('1. ✅ Both frontend and backend are working');
    console.log('2. 🌐 Visit: https://web-quiz-zone.vercel.app');
    console.log('3. 🔍 Open browser console (F12) to check environment variables');
    console.log('4. 🔐 Try to login and check API calls');
    console.log('5. 📝 Look for API calls to: https://web-quiz-zone.onrender.com');
  } else {
    console.log('1. ❌ Some services are not working');
    console.log('2. 🔧 Check deployment configurations');
    console.log('3. 📋 Review environment variables');
  }
  
  console.log('\n💡 Manual Verification:');
  console.log('1. Open: https://web-quiz-zone.vercel.app');
  console.log('2. Press F12 → Console');
  console.log('3. Look for debug environment variables output');
  console.log('4. Try login and check Network tab');
}

// Run tests
testProductionFix().catch(console.error); 