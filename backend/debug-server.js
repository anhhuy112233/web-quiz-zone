/**
 * Script debug server để kiểm tra lỗi khởi động
 */

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🚀 Starting debug server...');

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
      message: 'Debug server is running!',
      timestamp: new Date().toISOString()
    });
  });
  console.log('✅ Basic routes configured');

  console.log('5. Testing route imports...');
  
  console.log('   - Importing auth routes...');
  const authRoutes = await import('./src/routes/auth.js');
  console.log('   ✅ Auth routes imported');
  
  console.log('   - Importing user routes...');
  const userRoutes = await import('./src/routes/userRoutes.js');
  console.log('   ✅ User routes imported');
  
  console.log('   - Importing exam routes...');
  const examRoutes = await import('./src/routes/exams.js');
  console.log('   ✅ Exam routes imported');
  
  console.log('   - Importing result routes...');
  const resultRoutes = await import('./src/routes/results.js');
  console.log('   ✅ Result routes imported');

  console.log('6. Setting up API routes...');
  app.use('/api/auth', authRoutes.default);
  app.use('/api/users', userRoutes.default);
  app.use('/api/exams', examRoutes.default);
  app.use('/api/results', resultRoutes.default);
  console.log('✅ API routes configured');

  console.log('7. Setting up error handlers...');
  const { errorHandler, notFound } = await import('./src/middleware/errorHandler.js');
  app.use(notFound);
  app.use(errorHandler);
  console.log('✅ Error handlers configured');

  console.log('8. Starting server...');
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log('🎉 Debug server started successfully!');
  });

} catch (error) {
  console.error('❌ Error during server startup:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
} 