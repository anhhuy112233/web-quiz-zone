# 🚀 Cấu Hình Production - Web Quiz Zone

## 📋 Thông Tin Production

### URLs
- **Frontend (Vercel):** https://web-quiz-zone.vercel.app
- **Backend (Render):** https://web-quiz-zone.onrender.com
- **Database (MongoDB Atlas):** mongodb+srv://hyday23:huy123@webquizzone.hzbf0rv.mongodb.net/?retryWrites=true&w=majority&appName=webquizzone

## 🔧 Cấu Hình Render (Backend)

### Environment Variables
Thêm các biến môi trường sau trong Render Dashboard:

```env
MONGODB_URI=mongodb+srv://hyday23:huy123@webquizzone.hzbf0rv.mongodb.net/?retryWrites=true&w=majority&appName=webquizzone
JWT_SECRET=web-quiz-zone-production-secret-key-2024
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://web-quiz-zone.vercel.app
MAX_FILE_SIZE=5242880
```

### Cấu Hình Render Service
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Port:** 5000

## 🌐 Cấu Hình Vercel (Frontend)

### Environment Variables
Thêm các biến môi trường sau trong Vercel Dashboard:

```env
VITE_API_URL=https://web-quiz-zone.onrender.com
VITE_SOCKET_URL=https://web-quiz-zone.onrender.com
VITE_NODE_ENV=production
```

### Cấu Hình Vercel Project
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## 🗄️ Cấu Hình MongoDB Atlas

### Database Setup
1. **Database Name:** `exam-system`
2. **Collections cần tạo:**
   - `users`
   - `exams`
   - `results`

### Network Access
- **IP Access List:** `0.0.0.0/0` (cho phép tất cả IP)

### Database User
- **Username:** `hyday23`
- **Password:** `huy123`
- **Database User Privileges:** `Read and write to any database`

## 🧪 Test Kết Nối

### 1. Test Backend Health
```bash
curl https://web-quiz-zone.onrender.com/health
```

### 2. Test Frontend
Truy cập: https://web-quiz-zone.vercel.app

### 3. Test API Endpoints
```bash
# Test root endpoint
curl https://web-quiz-zone.onrender.com/

# Test auth endpoint
curl https://web-quiz-zone.onrender.com/api/auth/login
```

## 🔐 Tạo Tài Khoản Admin

Sau khi deploy thành công, tạo tài khoản admin bằng cách:

1. **Truy cập MongoDB Atlas**
2. **Vào Database > exam-system > users**
3. **Thêm document mới:**

```json
{
  "username": "admin",
  "email": "admin@webquizzone.com",
  "password": "$2b$10$hashed_password_here",
  "role": "admin",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🚨 Troubleshooting

### Lỗi CORS
- Kiểm tra `FRONTEND_URL` trong Render
- Đảm bảo URL chính xác: `https://web-quiz-zone.vercel.app`

### Lỗi MongoDB Connection
- Kiểm tra `MONGODB_URI` trong Render
- Kiểm tra Network Access trong MongoDB Atlas

### Lỗi Frontend API Calls
- Kiểm tra `VITE_API_URL` trong Vercel
- Đảm bảo URL chính xác: `https://web-quiz-zone.onrender.com`

## 📊 Monitoring

### Backend Logs
- Xem logs trong Render Dashboard
- Kiểm tra health endpoint: `/health`

### Frontend Logs
- Xem logs trong Vercel Dashboard
- Kiểm tra browser console

### Database Monitoring
- Xem metrics trong MongoDB Atlas
- Kiểm tra connection status 