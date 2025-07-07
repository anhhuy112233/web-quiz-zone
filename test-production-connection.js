/**
 * Script test kết nối production - Web Quiz Zone
 * Test frontend, backend và database connection
 */

const https = require('https');

// Production URLs
const PRODUCTION_URLS = {
  frontend: 'https://web-quiz-zone.vercel.app',
  backend: 'https://web-quiz-zone.onrender.com',
  backendHealth: 'https://web-quiz-zone.onrender.com/health',
  backendRoot: 'https://web-quiz-zone.onrender.com/',
  backendAuth: 'https://web-quiz-zone.onrender.com/api/auth/login'
};

/**
 * Test kết nối đến một URL
 * @param {string} url - URL cần test
 * @param {string} name - Tên của service
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
 * Test tất cả services
 */
async function testAllServices() {
  console.log('🚀 Testing Web Quiz Zone Production Environment...\n');
  console.log('='.repeat(60));
  
  const results = {};
  
  // Test frontend
  console.log('\n🌐 Testing Frontend (Vercel)');
  results.frontend = await testURL(PRODUCTION_URLS.frontend, 'Frontend');
  
  // Test backend health
  console.log('\n🏥 Testing Backend Health Check');
  results.backendHealth = await testURL(PRODUCTION_URLS.backendHealth, 'Backend Health');
  
  // Test backend root
  console.log('\n🏠 Testing Backend Root');
  results.backendRoot = await testURL(PRODUCTION_URLS.backendRoot, 'Backend Root');
  
  // Test backend auth endpoint
  console.log('\n🔐 Testing Backend Auth Endpoint');
  results.backendAuth = await testURL(PRODUCTION_URLS.backendAuth, 'Backend Auth');
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(60));
  
  Object.entries(results).forEach(([key, result]) => {
    const status = result.success ? '✅ OK' : '❌ FAILED';
    const statusCode = result.success ? ` (${result.status})` : '';
    console.log(`${key.padEnd(20)}: ${status}${statusCode}`);
  });
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  console.log('='.repeat(60));
  
  if (results.frontend.success) {
    console.log('✅ Frontend (Vercel) is working correctly');
    console.log(`   URL: ${PRODUCTION_URLS.frontend}`);
  } else {
    console.log('❌ Frontend has issues - check Vercel deployment');
  }
  
  if (results.backendHealth.success) {
    console.log('✅ Backend health check is responding');
    console.log('   Backend is healthy and ready to serve requests');
  } else {
    console.log('❌ Backend health check failed - check Render deployment');
  }
  
  if (results.backendRoot.success) {
    console.log('✅ Backend root endpoint is accessible');
  } else {
    console.log('❌ Backend root endpoint failed - check server configuration');
  }
  
  if (results.backendAuth.success) {
    console.log('✅ Backend auth endpoint is responding');
  } else {
    console.log('❌ Backend auth endpoint failed - check API routes');
  }
  
  // Next steps
  console.log('\n🎯 Next Steps:');
  console.log('='.repeat(60));
  
  if (results.frontend.success && results.backendHealth.success) {
    console.log('1. ✅ Both frontend and backend are working');
    console.log('2. 🌐 Visit: https://web-quiz-zone.vercel.app');
    console.log('3. 🔐 Create admin account in MongoDB Atlas');
    console.log('4. 🧪 Test login functionality');
  } else {
    console.log('1. ❌ Some services are not working');
    console.log('2. 🔧 Check deployment configurations');
    console.log('3. 📋 Review environment variables');
    console.log('4. 🐛 Check service logs');
  }
  
  console.log('\n📞 For support, check the logs in:');
  console.log('   - Vercel Dashboard (Frontend)');
  console.log('   - Render Dashboard (Backend)');
  console.log('   - MongoDB Atlas (Database)');
}

// Run tests
testAllServices().catch(console.error); 