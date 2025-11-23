// Import các thư viện cần thiết
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';

// Import routes
import authRoutes from './routes/auth.js';
import examRoutes from './routes/exams.js';
import resultRoutes from './routes/results.js';
import userRoutes from './routes/userRoutes.js';
import classRoutes from './routes/classes.js';

// Import middleware xử lý lỗi
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import Socket.IO manager
import SocketManager from './socket.js';

// Load biến môi trường từ file .env
dotenv.config();

// Tạo Express app
const app = express();

// Tạo HTTP server từ Express app (cần cho Socket.IO)
const server = http.createServer(app);

// ==================== MIDDLEWARE ====================

// CORS configuration - cho phép frontend kết nối
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parser middleware - parse JSON và URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== ROUTES ====================

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);

// Log registered routes (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('📋 Registered API routes:');
  console.log('  - /api/auth');
  console.log('  - /api/exams');
  console.log('  - /api/results');
  console.log('  - /api/users');
  console.log('  - /api/classes');
}

// ==================== SOCKET.IO ====================

// Khởi tạo Socket.IO manager
const socketManager = new SocketManager(server);

// ==================== ERROR HANDLING ====================

// 404 handler - phải đặt sau tất cả routes
app.use(notFound);

// Error handler - phải đặt cuối cùng
app.use(errorHandler);

// ==================== DATABASE CONNECTION ====================

// Kết nối MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 6+ không cần các options này nữa, nhưng giữ lại để tương thích
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Thoát process nếu không kết nối được database
    process.exit(1);
  }
};

// Xử lý sự kiện khi MongoDB disconnect
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

// Xử lý sự kiện khi MongoDB reconnect
mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// ==================== SERVER START ====================

// Lấy port từ biến môi trường hoặc mặc định 5000
const PORT = process.env.PORT || 5000;

// Khởi động server
const startServer = async () => {
  try {
    // Kết nối database trước
    await connectDB();

    // Sau đó mới start server
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);
      console.log(`🔌 Socket.IO ready`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Xử lý lỗi không bắt được (unhandled rejection)
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  // Đóng server và thoát process
  server.close(() => {
    process.exit(1);
  });
});

// Xử lý lỗi không bắt được (uncaught exception)
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Xử lý tín hiệu SIGTERM (khi process bị kill)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

// Khởi động server
startServer();
