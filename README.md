# 🎓 Hệ thống thi trắc nghiệm trực tuyến

Hệ thống thi trắc nghiệm trực tuyến với đầy đủ chức năng cho học sinh, giáo viên và quản trị viên.

## ✨ Tính năng chính

### 👨‍🎓 Học sinh
- Xem danh sách đề thi
- Làm bài thi trực tuyến
- Xem kết quả và điểm số
- Quản lý thông tin cá nhân

### 👨‍🏫 Giáo viên
- Tạo và quản lý đề thi
- Import câu hỏi từ file Excel
- Theo dõi quá trình thi real-time
- Xem kết quả và thống kê

### 👑 Quản trị viên
- Quản lý tất cả người dùng
- Quản lý tất cả đề thi
- Xem báo cáo hệ thống
- Cấu hình hệ thống

## 🚀 Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.IO** - Real-time communication
- **Multer** - File upload
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Socket.IO Client** - Real-time
- **Vite** - Build tool

## 📁 Cấu trúc project

```
web-thi-trac-nghiem/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Middleware functions
│   │   ├── utils/          # Utility functions
│   │   ├── constants/      # Constants
│   │   └── socket.js       # Socket.IO setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── contexts/      # React contexts
│   └── package.json
└── README.md
```

## 🛠️ Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js >= 16
- MongoDB >= 4.4
- npm hoặc yarn

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Tạo file .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Biến môi trường (.env)
```env
# Backend
MONGODB_URI=mongodb://localhost:27017/exam-system
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=5000

# Frontend
VITE_API_URL=http://localhost:5000/api
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user

### Users
- `GET /api/users` - Lấy danh sách users
- `POST /api/users` - Tạo user mới (admin/teacher)
- `PUT /api/users/profile` - Cập nhật profile
- `PUT /api/users/change-password` - Đổi mật khẩu

### Exams
- `GET /api/exams` - Lấy danh sách đề thi
- `POST /api/exams` - Tạo đề thi mới
- `POST /api/exams/parse-excel` - Import từ Excel
- `POST /api/exams/:id/start` - Bắt đầu thi
- `POST /api/exams/:id/submit` - Nộp bài

### Results
- `GET /api/results` - Lấy kết quả
- `GET /api/results/exam/:examId` - Kết quả theo đề thi

## 🔧 Development

### Code Style
- Sử dụng ESLint và Prettier
- Tuân thủ naming conventions
- Comment code rõ ràng
- Tách biệt concerns

### Best Practices
- Error handling tập trung
- Validation middleware
- Response format nhất quán
- Security best practices

### Testing
```bash
# Backend tests
npm test

# Frontend tests
npm test
```

## 📝 Changelog

### v1.0.0
- ✅ Hệ thống authentication
- ✅ Quản lý users và roles
- ✅ Tạo và quản lý đề thi
- ✅ Import Excel
- ✅ Real-time monitoring
- ✅ Admin dashboard
- ✅ Responsive design

## 🤝 Contributing

1. Fork project
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

- Email: your-email@example.com
- Project Link: [https://github.com/your-username/web-thi-trac-nghiem](https://github.com/your-username/web-thi-trac-nghiem)
