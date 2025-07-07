/**
 * Script kiểm tra môi trường hiện tại
 */

console.log('🔍 Checking Current Environment...');
console.log('='.repeat(50));

// Kiểm tra URL hiện tại
const currentUrl = window.location.href;
console.log('Current URL:', currentUrl);

// Kiểm tra environment variables
console.log('\n📋 Environment Variables:');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
console.log('VITE_NODE_ENV:', import.meta.env.VITE_NODE_ENV);
console.log('import.meta.env.PROD:', import.meta.env.PROD);
console.log('import.meta.env.DEV:', import.meta.env.DEV);
console.log('import.meta.env.MODE:', import.meta.env.MODE);

// Kiểm tra API configuration
console.log('\n🔧 API Configuration:');
console.log('API_BASE_URL will be:', import.meta.env.PROD 
  ? 'https://web-quiz-zone.onrender.com' 
  : (import.meta.env.VITE_API_URL || 'https://web-quiz-zone.onrender.com'));

// Phân tích
console.log('\n📊 Analysis:');
console.log('='.repeat(50));

if (currentUrl.includes('localhost')) {
  console.log('⚠️  You are testing on LOCALHOST!');
  console.log('   This means you are running the app locally.');
  console.log('   To test production, visit: https://web-quiz-zone.vercel.app');
} else if (currentUrl.includes('vercel.app')) {
  console.log('✅ You are testing on PRODUCTION (Vercel)!');
  console.log('   This is the correct environment for testing.');
} else {
  console.log('❓ Unknown environment:', currentUrl);
}

if (import.meta.env.PROD) {
  console.log('✅ Production mode detected');
  console.log('   API calls will go to: https://web-quiz-zone.onrender.com');
} else {
  console.log('⚠️  Development mode detected');
  console.log('   API calls may go to localhost if VITE_API_URL is not set');
}

// Recommendations
console.log('\n💡 Recommendations:');
console.log('='.repeat(50));

if (currentUrl.includes('localhost')) {
  console.log('1. 🌐 Visit production URL: https://web-quiz-zone.vercel.app');
  console.log('2. 🔍 Check if the fix has been deployed');
  console.log('3. 📝 Look for debug environment variables in console');
} else {
  console.log('1. 🔍 Check browser console for debug output');
  console.log('2. 🔐 Try to login and check Network tab');
  console.log('3. 📝 Verify API calls go to production URL');
}

console.log('\n🎯 Next Steps:');
console.log('1. Push code to GitHub');
console.log('2. Wait for Vercel auto-deploy');
console.log('3. Test on production URL'); 