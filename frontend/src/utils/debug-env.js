/**
 * Script debug environment variables
 * Kiểm tra xem environment variables có được load đúng không
 */

export const debugEnvironmentVariables = () => {
  console.log('🔍 Debugging Environment Variables...');
  console.log('='.repeat(50));
  
  // Kiểm tra các environment variables
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
  console.log('VITE_NODE_ENV:', import.meta.env.VITE_NODE_ENV);
  
  // Kiểm tra mode
  console.log('import.meta.env.MODE:', import.meta.env.MODE);
  console.log('import.meta.env.DEV:', import.meta.env.DEV);
  console.log('import.meta.env.PROD:', import.meta.env.PROD);
  
  // Kiểm tra base URL
  console.log('import.meta.env.BASE_URL:', import.meta.env.BASE_URL);
  
  // Phân tích kết quả
  console.log('\n📊 Analysis:');
  console.log('='.repeat(50));
  
  if (import.meta.env.VITE_API_URL) {
    console.log('✅ VITE_API_URL is set:', import.meta.env.VITE_API_URL);
    
    if (import.meta.env.VITE_API_URL.includes('localhost')) {
      console.log('⚠️  WARNING: API URL is pointing to localhost!');
      console.log('   This should be the production URL in production.');
    } else if (import.meta.env.VITE_API_URL.includes('web-quiz-zone.onrender.com')) {
      console.log('✅ API URL is pointing to production backend');
    }
  } else {
    console.log('❌ VITE_API_URL is not set!');
    console.log('   Using fallback URL from api.js');
  }
  
  if (import.meta.env.VITE_SOCKET_URL) {
    console.log('✅ VITE_SOCKET_URL is set:', import.meta.env.VITE_SOCKET_URL);
  } else {
    console.log('❌ VITE_SOCKET_URL is not set!');
  }
  
  if (import.meta.env.VITE_NODE_ENV) {
    console.log('✅ VITE_NODE_ENV is set:', import.meta.env.VITE_NODE_ENV);
  } else {
    console.log('❌ VITE_NODE_ENV is not set!');
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  console.log('='.repeat(50));
  
  if (!import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL.includes('localhost')) {
    console.log('🔧 Add to Vercel Environment Variables:');
    console.log('   VITE_API_URL=https://web-quiz-zone.onrender.com');
    console.log('   VITE_SOCKET_URL=https://web-quiz-zone.onrender.com');
    console.log('   VITE_NODE_ENV=production');
  } else {
    console.log('✅ Environment variables look good!');
  }
  
  console.log('\n🌐 Current API Base URL will be:');
  console.log('   ' + (import.meta.env.VITE_API_URL || 'https://web-quiz-zone.onrender.com'));
};

// Auto-run khi import
debugEnvironmentVariables(); 