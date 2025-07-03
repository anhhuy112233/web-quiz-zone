# QuizZone

Một ứng dụng web thi trắc nghiệm trực tuyến với các chức năng dành cho học sinh, giáo viên và quản trị viên.

## 🚀 Tính năng

### Cho Học Sinh
- Đăng ký và đăng nhập tài khoản
- Xem danh sách các bài thi có sẵn
- Tham gia thi trắc nghiệm
- Xem kết quả thi
- Theo dõi lịch sử thi

### Cho Giáo Viên
- Tạo và quản lý bài thi
- Thêm câu hỏi trắc nghiệm
- Theo dõi kết quả của học sinh
- Quản lý danh sách học sinh
- Giám sát quá trình thi

### Cho Quản Trị Viên
- Quản lý tài khoản người dùng
- Phân quyền người dùng
- Thống kê tổng quan hệ thống

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **React.js** - UI library
- **Vite** - Build tool
- **CSS3** - Styling
- **JavaScript (ES6+)** - Programming language

## 📁 Cấu trúc dự án

```
Web_Thi_Trac_Nghiem/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── controllers/     # Controllers
│   │   ├── middleware/      # Middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── app.js          # Main app file
│   └── package.json
├── frontend/               # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── styles/         # CSS files
│   └── package.json
└── README.md
```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js (v14 trở lên)
- MongoDB
- npm hoặc yarn

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Cấu hình

1. Tạo file `.env` trong thư mục `backend` với các biến môi trường:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quiz-app
JWT_SECRET=your-secret-key
```

2. Cấu hình MongoDB connection string trong backend

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Exams
- `GET /api/exams` - Lấy danh sách bài thi
- `POST /api/exams` - Tạo bài thi mới
- `GET /api/exams/:id` - Lấy chi tiết bài thi
- `PUT /api/exams/:id` - Cập nhật bài thi
- `DELETE /api/exams/:id` - Xóa bài thi

### Results
- `POST /api/results` - Nộp bài thi
- `GET /api/results` - Lấy kết quả thi

## 🤝 Đóng góp

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 Giấy phép

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

## 👥 Tác giả

- **Tên của bạn** - *Công việc ban đầu* - [GitHub](https://github.com/yourusername)

## 🙏 Cảm ơn

Cảm ơn bạn đã quan tâm đến dự án này! # web-thi-trac-nghiem
