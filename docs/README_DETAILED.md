# HỆ THỐNG THI TRỰC TUYẾN QUIZZONE - HƯỚNG DẪN CHI TIẾT

## 📋 Tổng quan hệ thống

Hệ thống thi trực tuyến QuizZone là một ứng dụng web full-stack cho phép:
- **Học sinh**: Tham gia thi trực tuyến, xem kết quả
- **Giáo viên**: Tạo và quản lý đề thi, giám sát quá trình thi, xem kết quả
- **Admin**: Quản lý người dùng, xem báo cáo tổng hợp

## 🏗️ Kiến trúc hệ thống

### Backend (Node.js + Express + MongoDB)
```
backend/
├── src/
│   ├── models/          # Định nghĩa schema database
│   ├── controllers/     # Logic xử lý business
│   ├── routes/          # Định nghĩa API endpoints
│   ├── middleware/      # Middleware xác thực, validation
│   ├── utils/           # Utility functions
│   ├── socket.js        # Socket.IO server
│   └── index.js         # Entry point
```

### Frontend (React + Vite + Tailwind CSS)
```
frontend/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Các trang của ứng dụng
│   ├── utils/          # Utility functions
│   └── App.jsx         # Component chính
```

## 🔐 Hệ thống xác thực và phân quyền

### JWT Authentication
- Sử dụng JWT token để xác thực
- Token được lưu trong localStorage
- Middleware `protect` kiểm tra token trước khi cho phép truy cập

### Role-based Access Control
- **Student**: Chỉ có thể làm bài thi và xem kết quả của mình
- **Teacher**: Có thể tạo, chỉnh sửa đề thi, giám sát và xem kết quả
- **Admin**: Có toàn quyền quản lý hệ thống

### Multi-session Support
- Hỗ trợ đăng nhập nhiều tài khoản cùng lúc
- Chuyển đổi giữa các session dễ dàng
- SessionManager quản lý tất cả sessions

## 📊 Database Schema

### User Model
```javascript
{
  name: String,           // Họ tên
  email: String,          // Email (unique)
  password: String,       // Mật khẩu (đã hash)
  role: String,           // student/teacher/admin
  createdAt: Date,        // Thời gian tạo
  lastLogin: Date         // Lần đăng nhập cuối
}
```

### Exam Model
```javascript
{
  title: String,          // Tiêu đề bài thi
  description: String,    // Mô tả
  duration: Number,       // Thời gian làm bài (phút)
  questions: [Question],  // Danh sách câu hỏi
  startTime: Date,        // Thời gian bắt đầu
  endTime: Date,          // Thời gian kết thúc
  createdBy: ObjectId,    // Người tạo
  status: String,         // draft/scheduled/active/completed
  participants: [ObjectId] // Danh sách người tham gia
}
```

### Result Model
```javascript
{
  exam: ObjectId,         // ID bài thi
  user: ObjectId,         // ID người làm
  answers: [Answer],      // Danh sách câu trả lời
  score: Number,          // Điểm số
  totalQuestions: Number, // Tổng số câu hỏi
  correctAnswers: Number, // Số câu đúng
  startTime: Date,        // Thời gian bắt đầu làm
  endTime: Date,          // Thời gian kết thúc
  duration: Number,       // Thời gian làm bài (phút)
  status: String          // in_progress/completed/timeout
}
```

## 🔄 Real-time Communication (Socket.IO)

### Server-side Socket Management
- **SocketManager**: Class quản lý tất cả kết nối Socket.IO
- **Authentication**: Xác thực token JWT khi kết nối
- **Room Management**: Quản lý phòng thi theo examId
- **Event Handling**: Xử lý các sự kiện real-time

### Client-side Socket Client
- **SocketClient**: Class quản lý kết nối từ frontend
- **Auto-reconnection**: Tự động kết nối lại khi mất kết nối
- **Event Emitters**: Gửi sự kiện đến server
- **Event Listeners**: Lắng nghe sự kiện từ server

### Các sự kiện Socket.IO chính
- `joinExam`: Tham gia phòng thi
- `leaveExam`: Rời phòng thi
- `examStarted`: Bắt đầu làm bài
- `submitAnswer`: Nộp câu trả lời
- `examCompleted`: Hoàn thành bài thi
- `timeUpdate`: Cập nhật thời gian
- `suspiciousActivity`: Báo cáo hoạt động đáng ngờ

## 🎯 Tính năng chính

### Cho Học sinh
1. **Xem danh sách bài thi**: Lọc theo trạng thái, thời gian
2. **Làm bài thi**: Giao diện thân thiện, timer real-time
3. **Xem kết quả**: Chi tiết từng câu hỏi và đáp án
4. **Quản lý profile**: Cập nhật thông tin cá nhân

### Cho Giáo viên
1. **Tạo đề thi**: Form tạo bài thi với câu hỏi
2. **Import Excel**: Import câu hỏi từ file Excel
3. **Quản lý đề thi**: Chỉnh sửa, xóa, xuất bản
4. **Giám sát real-time**: Xem học sinh đang làm bài
5. **Xem kết quả**: Thống kê chi tiết theo bài thi

### Cho Admin
1. **Quản lý người dùng**: Thêm, sửa, xóa user
2. **Báo cáo tổng hợp**: Thống kê toàn hệ thống
3. **Cài đặt hệ thống**: Cấu hình chung

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM cho MongoDB
- **Socket.IO**: Real-time communication
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **multer**: File upload
- **xlsx**: Excel file processing

### Frontend
- **React 18**: UI library
- **React Router**: Client-side routing
- **Vite**: Build tool
- **Tailwind CSS**: CSS framework
- **Socket.IO Client**: Real-time communication
- **Axios**: HTTP client

## 🚀 Cách chạy dự án

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Database
- Cần có MongoDB instance chạy
- Tạo file `.env` với các biến môi trường cần thiết

## 📁 Cấu trúc file chi tiết

### Backend Files
- `src/index.js`: Entry point, khởi tạo server
- `src/models/`: Định nghĩa database schema
- `src/controllers/`: Logic xử lý business
- `src/routes/`: API endpoints
- `src/middleware/`: Authentication, validation
- `src/socket.js`: Socket.IO server management

### Frontend Files
- `src/App.jsx`: Component chính, routing
- `src/components/`: Reusable components
- `src/pages/`: Page components theo role
- `src/utils/`: Utility functions
- `src/contexts/`: React contexts (nếu có)

## 🔧 Cấu hình môi trường

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/quizzone
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 📈 Tính năng nâng cao

### Security Features
- JWT token authentication
- Password hashing với bcrypt
- Role-based access control
- Input validation và sanitization
- CORS configuration

### Performance Features
- Database indexing cho các trường thường query
- Socket.IO connection pooling
- React component optimization
- Lazy loading cho routes

### User Experience
- Real-time notifications
- Responsive design
- Loading states
- Error handling
- Form validation

## 🐛 Debugging và Troubleshooting

### Common Issues
1. **Socket.IO connection failed**: Kiểm tra token và server URL
2. **Database connection error**: Kiểm tra MongoDB URI
3. **JWT token expired**: Refresh token hoặc login lại
4. **CORS error**: Kiểm tra cấu hình CORS

### Debug Tools
- Browser DevTools cho frontend
- Node.js debugger cho backend
- MongoDB Compass cho database
- Socket.IO debug mode

## 📝 Ghi chú phát triển

### Code Style
- Sử dụng ES6+ features
- Consistent naming conventions
- Proper error handling
- Comprehensive comments (tiếng Việt)

### Testing
- Unit tests cho utilities
- Integration tests cho API
- E2E tests cho user flows

### Deployment
- Docker containerization
- Environment-specific configs
- Database migration scripts
- SSL/TLS configuration

---

**Lưu ý**: Đây là hệ thống thi trực tuyến hoàn chỉnh với đầy đủ tính năng. Để sử dụng trong production, cần thêm các biện pháp bảo mật và tối ưu hóa phù hợp. 