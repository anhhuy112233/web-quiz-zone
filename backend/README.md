# Backend cho QuizZone

## Mô tả

Backend API cho hệ thống thi trắc nghiệm trực tuyến, được xây dựng với Node.js, Express và MongoDB.

## Giới thiệu
Backend API cho hệ thống thi trắc nghiệm trực tuyến, được xây dựng với Node.js, Express và MongoDB.

## Công nghệ sử dụng
- Node.js
- Express.js
- MongoDB với Mongoose
- Socket.IO cho real-time
- JWT cho xác thực
- Bcrypt cho mã hóa mật khẩu

## Cài đặt

1. Clone repository
2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file .env với các biến môi trường:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/exam_system
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

4. Chạy development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST /api/auth/register - Đăng ký tài khoản mới
- POST /api/auth/login - Đăng nhập
- GET /api/auth/me - Lấy thông tin người dùng hiện tại
- PATCH /api/auth/update-password - Cập nhật mật khẩu

### Exams
- GET /api/exams - Lấy danh sách bài thi
- GET /api/exams/:id - Lấy thông tin chi tiết bài thi
- POST /api/exams - Tạo bài thi mới (teacher/admin)
- PATCH /api/exams/:id - Cập nhật bài thi (teacher/admin)
- DELETE /api/exams/:id - Xóa bài thi (teacher/admin)
- POST /api/exams/:id/start - Bắt đầu làm bài thi (student)
- POST /api/exams/:id/submit - Nộp bài thi (student)

### Results
- GET /api/results - Lấy danh sách kết quả
- GET /api/results/:id - Lấy thông tin chi tiết kết quả
- GET /api/results/exam/:examId - Lấy kết quả của một bài thi (teacher/admin)
- GET /api/results/user/:userId - Lấy kết quả của một người dùng

## Socket.IO Events

### Client to Server
- join_exam - Tham gia phòng thi
- leave_exam - Rời phòng thi
- submit_exam - Nộp bài thi

### Server to Client
- exam_submitted - Thông báo bài thi đã được nộp

## Cấu trúc thư mục
```
backend/
├── src/
│   ├── controllers/    # Xử lý logic
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   └── index.js       # Entry point
├── .env              # Environment variables
└── package.json

huy 123 
``` 