# TÍCH HỢP SOCKET.IO REAL-TIME VÀ QUẢN LÝ SESSION/ĐA TÀI KHOẢN

## 1. Mục đích
- Đảm bảo các tính năng realtime: giám sát phòng thi, cập nhật tiến độ, cảnh báo, đồng bộ thời gian, thông báo trạng thái online/offline.
- Cho phép nhiều tài khoản đăng nhập, hoạt động đồng thời, mỗi phiên (session) được quản lý riêng biệt.

---

## 2. Cài đặt thư viện cần thiết

### Backend
```bash
cd backend
npm install socket.io
```

### Frontend
```bash
cd frontend
npm install socket.io-client
```

---

## 3. Cấu trúc file liên quan

- **backend/src/socket.js**: Quản lý logic Socket.IO server (sự kiện, xác thực, phòng thi, broadcast...)
- **backend/src/index.js**: Khởi tạo server, tích hợp Socket.IO vào Express
- **frontend/src/utils/socket.js**: Khởi tạo và quản lý kết nối Socket.IO phía client
- **frontend/src/components/common/RealTimeNotification.jsx**: Hiển thị thông báo realtime (có thể mở rộng cho các trang khác)

---

## 4. Tích hợp và code mẫu chi tiết

### 4.1 Backend: Khởi tạo và cấu hình Socket.IO

**File:** `backend/src/index.js`
```js
const express = require('express');
const http = require('http');
const SocketManager = require('./socket');
// ... các import khác

const app = express();
const server = http.createServer(app);
SocketManager(server); // Tích hợp socket.io

server.listen(process.env.PORT || 5000, () => {
  console.log('Server is running...');
});
```

**File:** `backend/src/socket.js`
```js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

module.exports = (server) => {
  const io = new Server(server, { cors: { origin: '*' } });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = user;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    // Lắng nghe các sự kiện: joinExam, leaveExam, sendMessage, ...
    socket.on('joinExam', (examId) => {
      socket.join(examId);
      io.to(examId).emit('userJoined', socket.user);
    });
    // ... các sự kiện khác
  });
};
```

---

### 4.2 Frontend: Kết nối và sử dụng Socket.IO

**File:** `frontend/src/utils/socket.js`
```js
import { io } from 'socket.io-client';

export const createSocket = (token) => {
  return io('http://localhost:5000', {
    auth: { token },
    autoConnect: false,
  });
};
```

**Sử dụng trong component (ví dụ):**
```js
// Trong một trang hoặc component
import { useEffect } from 'react';
import { createSocket } from '../utils/socket';

const socket = createSocket(localStorage.getItem('token'));

useEffect(() => {
  socket.connect();
  socket.emit('joinExam', examId);
  socket.on('userJoined', (user) => {
    // Xử lý khi có user mới vào phòng thi
  });
  return () => {
    socket.disconnect();
  };
}, []);
```

**Vị trí chèn ảnh giao diện minh họa:**
> ![Chèn ảnh giao diện phòng thi realtime tại đây]

---

## 5. Quản lý session/đa tài khoản (JWT)

- Khi đăng nhập, backend trả về JWT token.
- Token này được lưu ở localStorage/sessionStorage trên frontend.
- Mỗi tab/trình duyệt có thể đăng nhập tài khoản khác nhau, mỗi kết nối socket sẽ xác thực riêng bằng token.

**File:** `backend/src/middleware/auth.js`
```js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

**File:** `frontend/src/utils/sessionManager.js`
```js
export const setToken = (token) => localStorage.setItem('token', token);
export const getToken = () => localStorage.getItem('token');
export const removeToken = () => localStorage.removeItem('token');
```

---

## 6. Tổng kết các file đã sử dụng

| File                                      | Chức năng chính                                    |
|-------------------------------------------|----------------------------------------------------|
| backend/src/socket.js                     | Quản lý logic Socket.IO server                     |
| backend/src/index.js                      | Khởi tạo server, tích hợp Socket.IO                |
| backend/src/middleware/auth.js            | Middleware xác thực JWT cho API                    |
| frontend/src/utils/socket.js              | Kết nối và quản lý socket phía client              |
| frontend/src/utils/sessionManager.js      | Quản lý token đăng nhập phía client                |
| frontend/src/components/common/RealTimeNotification.jsx | Hiển thị thông báo realtime (nếu có) |

---

## 7. Ghi chú
- Đảm bảo backend và frontend chạy cùng domain hoặc cấu hình CORS phù hợp.
- Có thể mở rộng các sự kiện socket cho các tính năng khác như chat, cảnh báo, đồng bộ thời gian thi.
- Ảnh giao diện minh họa nên chèn vào các vị trí đã đánh dấu trong README này.

---

> **Tài liệu này trình bày chi tiết từng bước tích hợp Socket.IO real-time và quản lý session/đa tài khoản cho hệ thống web thi trắc nghiệm.** 