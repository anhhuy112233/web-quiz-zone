// Import các thư viện cần thiết
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load các biến môi trường từ file .env
dotenv.config();

console.log('🔧 Starting Exam System Backend...');

try {
  // Khởi tạo ứng dụng Express
  console.log('1. Creating Express app...');
  const app = express();
  const httpServer = createServer(app);
  console.log('✅ Express app created');

  // Middleware CORS - cho phép frontend kết nối từ domain khác
  console.log('2. Setting up CORS...');
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || 'https://web-quiz-zone.vercel.app'
      : 'http://localhost:3000',
    credentials: true
  }));
  console.log('✅ CORS configured');

  // Middleware để parse JSON từ request body
  console.log('3. Setting up JSON middleware...');
  app.use(express.json());
  console.log('✅ JSON middleware configured');



  // Route gốc - Health check
  console.log('4. Setting up basic routes...');
  app.get('/', (req, res) => {
    res.json({
      message: 'Exam System API is running!',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  console.log('✅ Basic routes configured');

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  });
  console.log('✅ Health check configured');

  // Import và đăng ký các routes
  console.log('5. Importing and registering API routes...');
  
  console.log('   - Importing auth routes...');
  const authRoutes = await import('./routes/auth.js');
  console.log('   ✅ Auth routes imported');
  
  console.log('   - Importing user routes...');
  const userRoutes = await import('./routes/userRoutes.js');
  console.log('   ✅ User routes imported');
  
  console.log('   - Importing exam routes...');
  const examRoutes = await import('./routes/exams.js');
  console.log('   ✅ Exam routes imported');
  
  console.log('   - Importing result routes...');
  const resultRoutes = await import('./routes/results.js');
  console.log('   ✅ Result routes imported');

  // Đăng ký các routes
  app.use('/api/auth', authRoutes.default);
  console.log('✅ Auth routes registered at /api/auth');
  
  app.use('/api/users', userRoutes.default);
  console.log('✅ User routes registered at /api/users');
  
  app.use('/api/exams', examRoutes.default);
  console.log('✅ Exam routes registered at /api/exams');
  
  app.use('/api/results', resultRoutes.default);
  console.log('✅ Result routes registered at /api/results');

  // Import Socket.IO manager
  console.log('6. Setting up Socket.IO...');
  const SocketManager = await import('./socket.js');
  const socketManager = new SocketManager.default(httpServer);
  console.log('✅ Socket.IO configured');

  // API endpoint để lấy thống kê hệ thống
  app.get('/api/stats', (req, res) => {
    const stats = socketManager.getSystemStats();
    res.json(stats);
  });
  console.log('✅ Stats endpoint configured');

  // Import và đăng ký error handlers
  console.log('7. Setting up error handlers...');
  const { errorHandler, notFound } = await import('./middleware/errorHandler.js');
  app.use(notFound);
  app.use(errorHandler);
  console.log('✅ Error handlers configured');

  // Kết nối đến MongoDB database
  console.log('8. Connecting to MongoDB...');
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
  
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
      
      // Khởi động server sau khi kết nối database thành công
      const PORT = process.env.PORT || 5000;
      console.log(`9. Starting server on port ${PORT}...`);
      
      httpServer.listen(PORT, () => {
        console.log(`✅ Server is running on port ${PORT}`);
        console.log('✅ Socket.IO server is ready for real-time connections');
        console.log('🎉 Application started successfully!');
        console.log(`🌐 API Base URL: http://localhost:${PORT}`);
        console.log(`🔐 Auth Endpoint: http://localhost:${PORT}/api/auth/login`);
      });
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    });

} catch (error) {
  console.error('❌ Error during server startup:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
} 