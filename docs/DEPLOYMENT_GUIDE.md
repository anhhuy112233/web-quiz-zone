# 🚀 Hướng Dẫn Triển Khai Hệ Thống Thi Trắc Nghiệm

## 📋 Tổng Quan
Hệ thống thi trắc nghiệm online với:
- **Frontend**: React + Vite (deploy trên Vercel)
- **Backend**: Node.js + Express (deploy trên Render)
- **Database**: MongoDB Atlas
- **Real-time**: Socket.IO

## 🏠 Chạy Trên Local

### 1. Cài Đặt Dependencies

```bash
# Cài đặt backend dependencies
cd backend
npm install

# Cài đặt frontend dependencies
cd ../frontend
npm install
```

### 2. Cấu Hình Environment Variables

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/exam-system
# Hoặc MongoDB Atlas URI cho production

# JWT Secret
JWT_SECRET=your-secret-key-here

# Server
PORT=5000
NODE_ENV=development

# CORS (cho frontend local)
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env.local)
```env
# API URL cho local
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Chạy Ứng Dụng

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
# Server sẽ chạy tại http://localhost:5000
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# App sẽ chạy tại http://localhost:5173
```

### 4. Kiểm Tra
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

## 🌐 Triển Khai Production

### 1. MongoDB Atlas Setup

1. Tạo cluster MongoDB Atlas
2. Tạo database user
3. Whitelist IP addresses (0.0.0.0/0 cho production)
4. Lấy connection string

### 2. Deploy Backend trên Render

1. **Tạo Web Service trên Render**
   - Connect GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Environment Variables trên Render**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/exam-system
   JWT_SECRET=your-production-secret-key
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

3. **Deploy**
   - Render sẽ tự động build và deploy
   - URL: `https://your-app-name.onrender.com`

### 3. Deploy Frontend trên Vercel

1. **Connect Repository**
   - Import từ GitHub
   - Root Directory: `frontend`

2. **Environment Variables trên Vercel**
   ```env
   VITE_API_URL=https://web-quiz-zone.onrender.com
   VITE_SOCKET_URL=https://web-quiz-zone.onrender.com
   ```

3. **Deploy**
   - Vercel sẽ tự động build và deploy
   - URL: `https://your-app-name.vercel.app`

## 🔧 Cấu Hình API URLs

### Tự Động Chuyển Đổi Environment

Hệ thống đã được cấu hình để tự động chuyển đổi giữa local và production:

```javascript
// utils/api.js
export const createApiUrl = (endpoint) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}${endpoint}`;
};
```

### Socket.IO Configuration

```javascript
// utils/socket.js
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
```

## 🧪 Testing

### Local Testing
1. Tạo tài khoản admin/teacher/student
2. Tạo bài thi với câu hỏi
3. Test làm bài thi
4. Test real-time monitoring

### Production Testing
1. Deploy backend trước
2. Test backend API endpoints
3. Deploy frontend
4. Test toàn bộ flow

## 🐛 Troubleshooting

### Backend Issues
- **Port 5000 đã được sử dụng**: Đổi PORT trong .env
- **MongoDB connection failed**: Kiểm tra MONGODB_URI
- **CORS errors**: Kiểm tra FRONTEND_URL

### Frontend Issues
- **API calls failed**: Kiểm tra VITE_API_URL
- **Socket connection failed**: Kiểm tra VITE_SOCKET_URL
- **Build errors**: Kiểm tra dependencies

### Production Issues
- **Render build failed**: Kiểm tra package.json scripts
- **Vercel build failed**: Kiểm tra Vite config
- **Environment variables**: Đảm bảo đã set đúng trên platform

## 📝 Checklist Triển Khai

### Pre-deployment
- [ ] Test toàn bộ functionality trên local
- [ ] Cấu hình MongoDB Atlas
- [ ] Chuẩn bị environment variables
- [ ] Commit và push code lên GitHub

### Backend Deployment
- [ ] Tạo Render Web Service
- [ ] Set environment variables
- [ ] Deploy và test API endpoints
- [ ] Kiểm tra health check endpoint

### Frontend Deployment
- [ ] Tạo Vercel project
- [ ] Set environment variables
- [ ] Deploy và test frontend
- [ ] Kiểm tra kết nối với backend

### Post-deployment
- [ ] Test đăng ký/đăng nhập
- [ ] Test tạo và làm bài thi
- [ ] Test real-time features
- [ ] Monitor logs và performance

## 🔒 Security Considerations

### Production Security
- Sử dụng strong JWT_SECRET
- Enable HTTPS
- Configure CORS properly
- Monitor API usage
- Regular security updates

### Database Security
- Use MongoDB Atlas security features
- Enable network access controls
- Regular backups
- Monitor database performance

## 📊 Monitoring

### Backend Monitoring (Render)
- Application logs
- Performance metrics
- Error tracking
- Uptime monitoring

### Frontend Monitoring (Vercel)
- Build status
- Performance analytics
- Error tracking
- User analytics

## 🚀 Performance Optimization

### Backend
- Enable compression
- Optimize database queries
- Use caching where appropriate
- Monitor memory usage

### Frontend
- Code splitting
- Lazy loading
- Optimize bundle size
- Use CDN for assets

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs trên Render/Vercel
2. Review environment variables
3. Test trên local trước
4. Check MongoDB Atlas status
5. Verify network connectivity

**Happy Deploying! 🎉** 