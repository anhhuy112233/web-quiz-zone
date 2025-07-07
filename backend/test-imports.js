/**
 * Script test import để kiểm tra lỗi
 */

console.log('Testing imports...');

try {
  console.log('1. Testing auth routes import...');
  const authRoutes = await import('./src/routes/auth.js');
  console.log('✅ Auth routes imported successfully');
  
  console.log('2. Testing auth controller import...');
  const authController = await import('./src/controllers/authController.js');
  console.log('✅ Auth controller imported successfully');
  
  console.log('3. Testing user model import...');
  const User = await import('./src/models/User.js');
  console.log('✅ User model imported successfully');
  
  console.log('4. Testing middleware import...');
  const middleware = await import('./src/middleware/auth.js');
  console.log('✅ Middleware imported successfully');
  
  console.log('5. Testing error handler import...');
  const errorHandler = await import('./src/middleware/errorHandler.js');
  console.log('✅ Error handler imported successfully');
  
  console.log('\n🎉 All imports successful!');
  
} catch (error) {
  console.error('❌ Import error:', error.message);
  console.error('Stack:', error.stack);
} 