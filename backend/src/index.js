// Import các thư viện cần thiết
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import các routes từ thư mục routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import examRoutes from './routes/exams.js';
import resultRoutes from './routes/results.js';
import SocketManager from './socket.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load các biến môi trường từ file .env
dotenv.config();

// Khởi tạo ứng dụng Express
const app = express();
const httpServer = createServer(app);

// Khởi tạo Socket.IO manager để xử lý kết nối real-time
const socketManager = new SocketManager(httpServer);

// Middleware CORS - cho phép frontend kết nối từ domain khác
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://your-frontend-domain.vercel.app'
    : 'http://localhost:3000',
  credentials: true
}));

// Middleware để parse JSON từ request body
app.use(express.json());

// Route gốc - Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Exam System API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Định nghĩa các routes cho API
app.use('/api/auth', authRoutes);      // Routes xử lý authentication
app.use('/api/users', userRoutes);     // Routes xử lý user management
app.use('/api/exams', examRoutes);     // Routes xử lý exam management
app.use('/api/results', resultRoutes); // Routes xử lý exam results

// API endpoint để lấy thống kê hệ thống (số lượng user online, etc.)
app.get('/api/stats', (req, res) => {
  const stats = socketManager.getSystemStats();
  res.json(stats);
});

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

// Middleware xử lý lỗi (phải đặt sau tất cả routes)
app.use(notFound);     // Xử lý khi không tìm thấy route
app.use(errorHandler); // Xử lý các lỗi chung

// Kết nối đến MongoDB database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Khởi động server sau khi kết nối database thành công
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Socket.IO server is ready for real-time connections');
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  }); 