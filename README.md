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
├── backend/                    # Thư mục chứa mã nguồn backend
│   ├── src/                   # Thư mục chứa mã nguồn chính
│   │   ├── controllers/       # Xử lý logic nghiệp vụ và tương tác với database
│   │   │   ├── authController.js    # Xử lý đăng nhập, đăng ký, xác thực
│   │   │   ├── examController.js    # Quản lý đề thi (tạo, sửa, xóa, lấy danh sách)
│   │   │   ├── resultController.js  # Xử lý kết quả thi và điểm số
│   │   │   └── userController.js    # Quản lý thông tin người dùng
│   │   ├── models/            # Định nghĩa cấu trúc dữ liệu MongoDB
│   │   │   ├── Exam.js        # Model đề thi (tên, mô tả, thời gian, câu hỏi)
│   │   │   ├── Result.js      # Model kết quả thi (điểm, thời gian làm bài)
│   │   │   ├── Test.js        # Model bài thi (trạng thái, câu trả lời)
│   │   │   └── User.js        # Model người dùng (thông tin cá nhân, role)
│   │   ├── routes/            # Định nghĩa các endpoint API
│   │   │   ├── auth.js        # Routes xác thực (/login, /register, /logout)
│   │   │   ├── exams.js       # Routes đề thi (/exams, /exams/:id)
│   │   │   ├── results.js     # Routes kết quả (/results, /results/:id)
│   │   │   └── users.js       # Routes người dùng (/users, /users/:id)
│   │   ├── middleware/        # Các hàm middleware xử lý request
│   │   │   ├── auth.js        # Middleware xác thực JWT token
│   │   │   ├── errorHandler.js # Xử lý lỗi tập trung
│   │   │   └── validation.js  # Validate dữ liệu đầu vào
│   │   ├── utils/             # Các hàm tiện ích
│   │   │   └── response.js    # Format response chuẩn cho API
│   │   ├── constants/         # Các hằng số của hệ thống
│   │   │   └── index.js       # Định nghĩa roles, status codes
│   │   ├── socket.js          # Cấu hình Socket.IO cho real-time
│   │   ├── seedData.js        # Dữ liệu mẫu để khởi tạo database
│   │   └── index.js           # File khởi động server chính
│   ├── package.json           # Dependencies và scripts của backend
│   ├── package-lock.json      # Lock file cho npm
│   ├── env.example            # File mẫu cho biến môi trường
│   └── README.md              # Hướng dẫn backend
├── frontend/                  # Thư mục chứa mã nguồn frontend
│   ├── src/                   # Thư mục chứa mã nguồn chính
│   │   ├── components/        # Các component có thể tái sử dụng
│   │   │   ├── common/        # Components dùng chung
│   │   │   │   ├── Alert.jsx          # Component hiển thị thông báo
│   │   │   │   ├── Button.jsx         # Component nút bấm
│   │   │   │   ├── Card.jsx           # Component card hiển thị
│   │   │   │   ├── Input.jsx          # Component input form
│   │   │   │   ├── Loading.jsx        # Component loading spinner
│   │   │   │   ├── Modal.jsx          # Component modal popup
│   │   │   │   ├── ProfileForm.jsx    # Form chỉnh sửa thông tin cá nhân
│   │   │   │   ├── ChangePasswordForm.jsx # Form đổi mật khẩu
│   │   │   │   └── RealTimeNotification.jsx # Thông báo real-time
│   │   │   ├── teacher/       # Components dành cho giáo viên
│   │   │   │   ├── ExamForm.jsx       # Form tạo/sửa đề thi
│   │   │   │   ├── ExamList.jsx       # Danh sách đề thi
│   │   │   │   └── ImportExcel.jsx    # Import câu hỏi từ Excel
│   │   │   ├── Header.jsx     # Header chung của ứng dụng
│   │   │   ├── Footer.jsx     # Footer chung của ứng dụng
│   │   │   └── SessionSwitcher.jsx # Chuyển đổi role người dùng
│   │   ├── pages/             # Các trang chính của ứng dụng
│   │   │   ├── admin/         # Trang dành cho quản trị viên
│   │   │   │   ├── Dashboard.jsx      # Dashboard tổng quan
│   │   │   │   ├── Users.jsx          # Quản lý người dùng
│   │   │   │   ├── Exams.jsx          # Quản lý đề thi
│   │   │   │   ├── Reports.jsx        # Báo cáo thống kê
│   │   │   │   ├── Settings.jsx       # Cài đặt hệ thống
│   │   │   │   └── Profile.jsx        # Thông tin cá nhân admin
│   │   │   ├── teacher/       # Trang dành cho giáo viên
│   │   │   │   ├── Dashboard.jsx      # Dashboard giáo viên
│   │   │   │   ├── CreateExam.jsx     # Tạo đề thi mới
│   │   │   │   ├── EditExam.jsx       # Chỉnh sửa đề thi
│   │   │   │   ├── Exams.jsx          # Danh sách đề thi
│   │   │   │   ├── Monitor.jsx        # Theo dõi thi real-time
│   │   │   │   ├── ExamResults.jsx    # Kết quả thi
│   │   │   │   ├── ExamDetailResults.jsx # Chi tiết kết quả
│   │   │   │   ├── Students.jsx       # Quản lý học sinh
│   │   │   │   └── Profile.jsx        # Thông tin cá nhân giáo viên
│   │   │   ├── student/       # Trang dành cho học sinh
│   │   │   │   ├── Dashboard.jsx      # Dashboard học sinh
│   │   │   │   ├── Exams.jsx          # Danh sách đề thi có thể làm
│   │   │   │   ├── ExamStart.jsx      # Trang bắt đầu làm bài
│   │   │   │   ├── ExamResult.jsx     # Kết quả bài thi
│   │   │   │   ├── ExamDetailResult.jsx # Chi tiết kết quả
│   │   │   │   ├── StudentResults.jsx # Lịch sử kết quả
│   │   │   │   └── Profile.jsx        # Thông tin cá nhân học sinh
│   │   │   ├── Landing.jsx    # Trang chủ giới thiệu
│   │   │   ├── Login.jsx      # Trang đăng nhập
│   │   │   ├── Register.jsx   # Trang đăng ký
│   │   │   └── test.jsx       # Trang test (development)
│   │   ├── utils/             # Các hàm tiện ích
│   │   │   ├── api.js         # Cấu hình và gọi API
│   │   │   ├── dateUtils.js   # Xử lý ngày tháng
│   │   │   ├── sessionManager.js # Quản lý session người dùng
│   │   │   └── socket.js      # Cấu hình Socket.IO client
│   │   ├── contexts/          # React Context cho state management
│   │   ├── assets/            # Tài nguyên tĩnh (hình ảnh, icons)
│   │   │   └── react.svg      # Logo React
│   │   ├── styles/            # File CSS tùy chỉnh
│   │   ├── App.jsx            # Component chính của ứng dụng
│   │   ├── index.jsx          # Entry point của React app
│   │   └── index.css          # CSS toàn cục
│   ├── public/                # Tài nguyên công khai
│   │   └── vite.svg           # Logo Vite
│   ├── package.json           # Dependencies và scripts của frontend
│   ├── package-lock.json      # Lock file cho npm
│   ├── vite.config.js         # Cấu hình Vite build tool
│   ├── tailwind.config.js     # Cấu hình Tailwind CSS
│   ├── postcss.config.js      # Cấu hình PostCSS
│   ├── eslint.config.js       # Cấu hình ESLint
│   └── README.md              # Hướng dẫn frontend
├── docs/                      # Thư mục tài liệu
│   ├── de_thi_tieng_anh.csv   # Dữ liệu mẫu đề thi tiếng Anh
│   ├── template_cau_hoi.csv   # Template import câu hỏi
│   ├── IMPORT_EXCEL_GUIDE.md  # Hướng dẫn import Excel
│   ├── LIBRARIES_OVERVIEW.md  # Tổng quan thư viện sử dụng
│   ├── README_DETAILED.md     # Tài liệu chi tiết
│   ├── SOCKET_IO_GUIDE.md     # Hướng dẫn Socket.IO
│   └── TAILWIND_SETUP.md      # Hướng dẫn setup Tailwind
└── README.md                  # Tài liệu tổng quan project
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
-


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
