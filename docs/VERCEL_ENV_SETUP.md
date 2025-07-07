# 🔧 Cấu Hình Environment Variables Trên Vercel

## 🚨 Vấn Đề Hiện Tại
Frontend đang cố gắng kết nối đến `http://localhost:5000` thay vì backend production URL.

## ✅ Giải Pháp

### 1. Truy Cập Vercel Dashboard
1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project `web-quiz-zone`
3. Vào tab **Settings**

### 2. Cấu Hình Environment Variables
Trong phần **Environment Variables**, thêm các biến sau:

#### Production Environment:
```
VITE_API_URL=https://web-quiz-zone.onrender.com
VITE_SOCKET_URL=https://web-quiz-zone.onrender.com
VITE_NODE_ENV=production
```

#### Preview Environment (nếu có):
```
VITE_API_URL=https://web-quiz-zone.onrender.com
VITE_SOCKET_URL=https://web-quiz-zone.onrender.com
VITE_NODE_ENV=production
```

### 3. Redeploy Frontend
1. Sau khi thêm environment variables
2. Vào tab **Deployments**
3. Click **Redeploy** trên deployment mới nhất
4. Hoặc push code mới để trigger auto-deploy

### 4. Kiểm Tra Cấu Hình
Sau khi deploy, kiểm tra:
1. Mở browser console (F12)
2. Tìm log: `API_BASE_URL: https://web-quiz-zone.onrender.com`
3. Test login và xem API calls

## 🔍 Debug Steps

### Kiểm Tra Environment Variables
```javascript
// Trong browser console
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
console.log('VITE_NODE_ENV:', import.meta.env.VITE_NODE_ENV);
```

### Kiểm Tra API Calls
1. Mở Developer Tools (F12)
2. Vào tab **Network**
3. Thử login
4. Xem API calls có đi đến `https://web-quiz-zone.onrender.com` không

## 🚨 Troubleshooting

### Nếu vẫn còn lỗi localhost:
1. **Clear browser cache**
2. **Hard refresh** (Ctrl+F5)
3. **Check Vercel deployment logs**
4. **Verify environment variables are set correctly**

### Nếu environment variables không được load:
1. **Redeploy frontend**
2. **Check Vercel build logs**
3. **Verify variable names start with VITE_**

## 📋 Checklist

- [ ] Environment variables đã được thêm vào Vercel
- [ ] Frontend đã được redeploy
- [ ] API calls đi đến production URL
- [ ] Không còn lỗi localhost
- [ ] Login hoạt động bình thường 