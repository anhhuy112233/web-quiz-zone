# Hướng dẫn Deploy Hệ thống Thi trực tuyến

## 🚀 Tổng quan

Hệ thống thi trực tuyến được chia thành 3 phần chính:
- **Frontend**: React + Vite (Deploy trên Vercel/Netlify)
- **Backend**: Node.js + Express + Socket.IO (Deploy trên Render/Railway)
- **Database**: MongoDB Atlas

## 📋 Yêu cầu trước khi deploy

### 1. MongoDB Atlas
1. Tạo tài khoản MongoDB Atlas
2. Tạo cluster mới
3. Tạo database user
4. Lấy connection string
5. Cấu hình Network Access (0.0.0.0/0 cho production)

### 2. Environment Variables
Tạo file `.env` trong thư mục `backend/` với các biến sau:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/exam-system?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.vercel.app

# File Upload Configuration
MAX_FILE_SIZE=5242880
```

## 🎯 Deploy Backend (Render/Railway)

### Render.com
1. **Tạo tài khoản Render**
2. **Tạo Web Service mới**
3. **Connect GitHub repository**
4. **Cấu hình:**
   - **Name**: exam-system-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Port**: 5000

5. **Environment Variables:**
   - `MONGODB_URI`: Connection string từ MongoDB Atlas
   - `JWT_SECRET`: Secret key cho JWT
   - `NODE_ENV`: production
   - `FRONTEND_URL`: URL frontend của bạn

6. **Deploy**

### Railway.app
1. **Tạo tài khoản Railway**
2. **Tạo project mới**
3. **Connect GitHub repository**
4. **Cấu hình Environment Variables**
5. **Deploy**

## 🌐 Deploy Frontend (Vercel/Netlify)

### Vercel
1. **Tạo tài khoản Vercel**
2. **Import GitHub repository**
3. **Cấu hình:**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables:**
   - `VITE_API_URL`: URL backend của bạn
   - `VITE_SOCKET_URL`: URL backend của bạn

5. **Deploy**

### Netlify
1. **Tạo tài khoản Netlify**
2. **Import GitHub repository**
3. **Cấu hình:**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

4. **Environment Variables:**
   - `VITE_API_URL`: URL backend của bạn
   - `VITE_SOCKET_URL`: URL backend của bạn

5. **Deploy**

## 🔧 Cấu hình sau khi deploy

### 1. Cập nhật CORS
Sau khi có URL frontend, cập nhật `FRONTEND_URL` trong backend environment variables.

### 2. Test kết nối
1. Test API endpoints
2. Test Socket.IO connection
3. Test file upload (nếu có)

### 3. SSL/HTTPS
- Vercel/Netlify tự động có SSL
- Render/Railway cũng hỗ trợ SSL

## 🛠️ Troubleshooting

### Lỗi thường gặp:

1. **CORS Error**
   - Kiểm tra `FRONTEND_URL` trong backend
   - Đảm bảo URL chính xác

2. **Socket.IO Connection Failed**
   - Kiểm tra `VITE_SOCKET_URL` trong frontend
   - Đảm bảo backend hỗ trợ WebSocket

3. **MongoDB Connection Failed**
   - Kiểm tra `MONGODB_URI`
   - Kiểm tra Network Access trong MongoDB Atlas

4. **Build Failed**
   - Kiểm tra Node.js version
   - Kiểm tra dependencies

## 📊 Monitoring

### Backend Health Check
```bash
curl https://your-backend-domain.onrender.com/api/stats
```

### Frontend Health Check
Truy cập URL frontend và kiểm tra console logs.

## 🔒 Security Checklist

- [ ] JWT_SECRET được thay đổi
- [ ] MongoDB user có quyền hạn phù hợp
- [ ] CORS được cấu hình đúng
- [ ] Environment variables không commit lên Git
- [ ] SSL/HTTPS được bật

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Console logs trong browser
2. Server logs trong Render/Railway
3. MongoDB Atlas logs
4. Network tab trong browser DevTools 