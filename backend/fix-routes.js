/**
 * Script fix routes để giải quyết vấn đề route không tìm thấy
 * Thêm debug logs và kiểm tra từng bước
 */

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔧 Fixing routes issue...');

try {
  console.log('1. Creating Express app...');
  const app = express();
  const httpServer = createServer(app);
  console.log('✅ Express app created');

  console.log('2. Setting up CORS...');
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || 'https://web-quiz-zone.vercel.app'
      : 'http://localhost:3000',
    credentials: true
  }));
  console.log('✅ CORS configured');

  console.log('3. Setting up JSON middleware...');
  app.use(express.json());
  console.log('✅ JSON middleware configured');

  console.log('4. Setting up basic routes...');
  app.get('/', (req, res) => {
    res.json({
      message: 'Fixed server is running!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  console.log('✅ Basic routes configured');

  console.log('5. Testing route imports one by one...');
  
  // Test auth routes
  console.log('   - Testing auth routes import...');
  const authRoutes = await import('./src/routes/auth.js');
  console.log('   ✅ Auth routes imported');
  console.log('   Auth routes type:', typeof authRoutes.default);
  console.log('   Auth routes keys:', Object.keys(authRoutes.default || {}));
  
  // Test user routes
  console.log('   - Testing user routes import...');
  const userRoutes = await import('./src/routes/userRoutes.js');
  console.log('   ✅ User routes imported');
  
  // Test exam routes
  console.log('   - Testing exam routes import...');
  const examRoutes = await import('./src/routes/exams.js');
  console.log('   ✅ Exam routes imported');
  
  // Test result routes
  console.log('   - Testing result routes import...');
  const resultRoutes = await import('./src/routes/results.js');
  console.log('   ✅ Result routes imported');

  console.log('6. Setting up API routes with debug...');
  
  // Add debug middleware to log all requests
  app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
  
  app.use('/api/auth', authRoutes.default);
  console.log('✅ Auth routes registered at /api/auth');
  
  app.use('/api/users', userRoutes.default);
  console.log('✅ User routes registered at /api/users');
  
  app.use('/api/exams', examRoutes.default);
  console.log('✅ Exam routes registered at /api/exams');
  
  app.use('/api/results', resultRoutes.default);
  console.log('✅ Result routes registered at /api/results');

  console.log('7. Setting up error handlers...');
  const { errorHandler, notFound } = await import('./src/middleware/errorHandler.js');
  app.use(notFound);
  app.use(errorHandler);
  console.log('✅ Error handlers configured');

  console.log('8. Starting server...');
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`✅ Fixed server is running on port ${PORT}`);
    console.log('🎉 Fixed server started successfully!');
    console.log(`🌐 Test URL: http://localhost:${PORT}`);
    console.log(`🔐 Test auth: http://localhost:${PORT}/api/auth/login`);
    console.log(`👥 Test users: http://localhost:${PORT}/api/users`);
    console.log(`📝 Test exams: http://localhost:${PORT}/api/exams`);
  });

} catch (error) {
  console.error('❌ Error during server startup:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
} 