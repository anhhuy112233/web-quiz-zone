# QuizZone

## Mô tả
Hệ thống thi trắc nghiệm trực tuyến cho phép giáo viên tạo và quản lý các bài thi, học sinh tham gia thi và xem kết quả, cùng với khả năng giám sát thời gian thực.

## Công nghệ sử dụng
- Frontend: ReactJS (Vite) + HTML + CSS + JavaScript
- Backend: NodeJS + Express
- Real-time: Socket.IO
- Database: MongoDB
- Authentication: JWT Token + Bcrypt

## Cấu trúc thư mục
```
frontend/
├── src/
│   ├── components/     # Các component tái sử dụng
│   ├── pages/         # Các trang chính của ứng dụng
│   ├── styles/        # CSS files
│   ├── utils/         # Các hàm tiện ích
│   ├── services/      # API services
│   ├── context/       # React Context
│   └── assets/        # Images, fonts, etc.
├── public/            # Static files
└── package.json
```

## Cài đặt và chạy
1. Clone repository
2. Cài đặt dependencies:
```bash
npm install
```
3. Chạy development server:
```bash
npm run dev
```

## Tính năng chính
### Học sinh
- Đăng ký/Đăng nhập
- Tham gia kỳ thi
- Làm bài trắc nghiệm
- Xem kết quả và lịch sử thi

### Giáo viên
- Quản lý đề thi
- Giám sát học sinh real-time
- Xem và xuất kết quả

### Admin
- Quản lý người dùng
- Cấu hình hệ thống
