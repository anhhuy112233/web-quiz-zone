# 📋 TỔNG HỢP CÁC CHỨC NĂNG DỰ ÁN - HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN

## 🎯 TỔNG QUAN

Hệ thống thi trắc nghiệm trực tuyến với đầy đủ chức năng cho 3 vai trò: **Học sinh**, **Giáo viên**, và **Quản trị viên**. Hệ thống hỗ trợ real-time monitoring, import Excel, và quản lý toàn diện.

---

## 🔐 1. CHỨC NĂNG XÁC THỰC (AUTHENTICATION)

### 1.1. Đăng ký tài khoản
- **Endpoint**: `POST /api/auth/register`
- **Chức năng**:
  - Đăng ký tài khoản mới với thông tin: name, email, password, role
  - Hỗ trợ 3 vai trò: student, teacher, admin
  - Mã hóa mật khẩu bằng bcryptjs
  - Validation email và password
  - Tự động đăng nhập sau khi đăng ký thành công

### 1.2. Đăng nhập
- **Endpoint**: `POST /api/auth/login`
- **Chức năng**:
  - Xác thực email và mật khẩu
  - Trả về JWT token và thông tin user
  - Lưu token vào localStorage/sessionStorage
  - Tự động kết nối Socket.IO sau khi đăng nhập

### 1.3. Lấy thông tin user hiện tại
- **Endpoint**: `GET /api/auth/me`
- **Chức năng**:
  - Lấy thông tin user từ JWT token
  - Yêu cầu đăng nhập (protected route)

### 1.4. Đổi mật khẩu
- **Endpoint**: `PATCH /api/auth/update-password`
- **Chức năng**:
  - Xác thực mật khẩu hiện tại
  - Cập nhật mật khẩu mới
  - Mã hóa mật khẩu mới

---

## 👨‍🎓 2. CHỨC NĂNG CHO HỌC SINH (STUDENT)

### 2.1. Dashboard
- **Route**: `/student/dashboard`
- **Chức năng**:
  - Hiển thị tổng quan thống kê cá nhân
  - Số bài thi đã làm
  - Điểm trung bình
  - Bài thi sắp tới
  - Bài thi đã hoàn thành

### 2.2. Xem danh sách đề thi
- **Route**: `/student/exams`
- **Endpoint**: `GET /api/exams`
- **Chức năng**:
  - Xem tất cả đề thi có thể làm
  - Lọc theo trạng thái (active, scheduled, completed)
  - Tìm kiếm đề thi
  - Xem thông tin: tên, mô tả, thời gian, số câu hỏi

### 2.3. Làm bài thi
- **Route**: `/student/exams/:id/start`
- **Endpoints**: 
  - `POST /api/exams/:id/start` - Bắt đầu làm bài
  - `POST /api/exams/:id/submit` - Nộp bài
- **Chức năng**:
  - Bắt đầu làm bài thi với timer real-time
  - Hiển thị câu hỏi và đáp án (A, B, C, D)
  - Chọn đáp án và lưu tạm thời
  - Đánh dấu câu hỏi đã làm/chưa làm
  - Xem số câu đã làm / tổng số câu
  - Tự động nộp bài khi hết thời gian
  - Real-time cập nhật thời gian còn lại
  - Socket.IO events:
    - `joinExam` - Tham gia phòng thi
    - `examStarted` - Bắt đầu làm bài
    - `submitAnswer` - Nộp từng câu trả lời
    - `timeUpdate` - Cập nhật thời gian
    - `examCompleted` - Hoàn thành bài thi

### 2.4. Xem kết quả bài thi
- **Route**: `/student/exams/:id/result`
- **Endpoint**: `GET /api/results/:id`
- **Chức năng**:
  - Xem điểm số và thống kê
  - Xem chi tiết từng câu hỏi
  - Xem đáp án đúng/sai
  - Xem đáp án đã chọn
  - Thời gian làm bài

### 2.5. Xem chi tiết kết quả
- **Route**: `/student/exams/:id/detail-result`
- **Chức năng**:
  - Xem chi tiết từng câu hỏi
  - So sánh đáp án đã chọn với đáp án đúng
  - Xem giải thích (nếu có)

### 2.6. Lịch sử kết quả
- **Route**: `/student/results`
- **Endpoint**: `GET /api/results/user/:userId`
- **Chức năng**:
  - Xem tất cả kết quả đã làm
  - Lọc và sắp xếp theo thời gian
  - Xem điểm số và thời gian làm bài

### 2.7. Quản lý profile
- **Route**: `/student/profile`
- **Endpoints**:
  - `GET /api/users/profile` - Lấy thông tin profile
  - `PUT /api/users/profile` - Cập nhật profile
- **Chức năng**:
  - Xem thông tin cá nhân
  - Cập nhật tên, email
  - Đổi mật khẩu

---

## 👨‍🏫 3. CHỨC NĂNG CHO GIÁO VIÊN (TEACHER)

### 3.1. Dashboard
- **Route**: `/teacher/dashboard`
- **Chức năng**:
  - Thống kê tổng quan:
    - Số đề thi đã tạo
    - Số học sinh đang làm bài
    - Số bài thi đã hoàn thành
    - Điểm trung bình của học sinh

### 3.2. Tạo đề thi
- **Route**: `/teacher/create-exam`
- **Endpoint**: `POST /api/exams`
- **Chức năng**:
  - Tạo đề thi mới với form:
    - Tên đề thi
    - Mô tả
    - Thời gian làm bài (phút)
    - Ngày bắt đầu/kết thúc
    - Trạng thái (draft, scheduled, active)
  - Thêm câu hỏi:
    - Câu hỏi
    - 4 đáp án (A, B, C, D)
    - Đáp án đúng
    - Điểm số cho mỗi câu
    - Giải thích (tùy chọn)
  - Thêm/xóa câu hỏi động
  - Preview đề thi trước khi lưu

### 3.3. Import câu hỏi từ Excel
- **Route**: `/teacher/create-exam` (tab Import Excel)
- **Endpoint**: `POST /api/exams/parse-excel`
- **Chức năng**:
  - Upload file Excel (.xlsx, .xls) hoặc CSV
  - Parse và validate dữ liệu
  - Import hàng loạt câu hỏi
  - Hỗ trợ template có sẵn
  - Xem preview trước khi import

### 3.4. Quản lý đề thi
- **Route**: `/teacher/exams`
- **Endpoints**:
  - `GET /api/exams` - Lấy danh sách đề thi
  - `GET /api/exams/:id` - Xem chi tiết đề thi
  - `PATCH /api/exams/:id` - Cập nhật đề thi
  - `DELETE /api/exams/:id` - Xóa đề thi
- **Chức năng**:
  - Xem danh sách tất cả đề thi đã tạo
  - Lọc theo trạng thái
  - Tìm kiếm đề thi
  - Chỉnh sửa đề thi
  - Xóa đề thi
  - Xuất bản/Ẩn đề thi

### 3.5. Chỉnh sửa đề thi
- **Route**: `/teacher/exams/:id/edit`
- **Chức năng**:
  - Chỉnh sửa thông tin đề thi
  - Thêm/sửa/xóa câu hỏi
  - Cập nhật đáp án
  - Lưu thay đổi

### 3.6. Giám sát real-time
- **Route**: `/teacher/exams/:examId/monitor`
- **Socket.IO Events**:
  - `startMonitoring` - Bắt đầu giám sát
  - `examStats` - Nhận thống kê real-time
  - `userJoinedExam` - Học sinh tham gia
  - `userLeftExam` - Học sinh rời khỏi
  - `answerSubmitted` - Học sinh nộp câu trả lời
  - `examCompleted` - Học sinh hoàn thành
  - `suspiciousActivity` - Phát hiện hoạt động đáng ngờ
- **Chức năng**:
  - Xem danh sách học sinh đang làm bài real-time
  - Xem thống kê:
    - Số học sinh đã tham gia
    - Số học sinh đang làm bài
    - Số học sinh đã hoàn thành
    - Tỷ lệ hoàn thành
  - Xem tiến độ làm bài của từng học sinh
  - Nhận cảnh báo hoạt động đáng ngờ
  - Xem thời gian còn lại của từng học sinh

### 3.7. Xem kết quả bài thi
- **Route**: `/teacher/results`
- **Endpoints**:
  - `GET /api/results` - Lấy danh sách kết quả
  - `GET /api/results/exam/:examId` - Kết quả của một đề thi
- **Chức năng**:
  - Xem tất cả kết quả của các đề thi
  - Lọc theo đề thi
  - Xem điểm số, thời gian làm bài
  - Xuất báo cáo

### 3.8. Xem chi tiết kết quả
- **Route**: `/teacher/exams/:examId/results`
- **Chức năng**:
  - Xem danh sách học sinh đã làm bài
  - Xem điểm số từng học sinh
  - Xem chi tiết câu trả lời của từng học sinh
  - Thống kê:
    - Điểm trung bình
    - Điểm cao nhất/thấp nhất
    - Tỷ lệ đúng/sai từng câu hỏi

### 3.9. Quản lý học sinh
- **Route**: `/teacher/students`
- **Endpoint**: `GET /api/users?role=student`
- **Chức năng**:
  - Xem danh sách học sinh
  - Tìm kiếm học sinh
  - Xem thông tin chi tiết học sinh
  - Xem lịch sử làm bài của học sinh

### 3.10. Quản lý profile
- **Route**: `/teacher/profile`
- **Chức năng**:
  - Xem và cập nhật thông tin cá nhân
  - Đổi mật khẩu

---

## 👑 4. CHỨC NĂNG CHO QUẢN TRỊ VIÊN (ADMIN)

### 4.1. Dashboard
- **Route**: `/admin/dashboard`
- **Chức năng**:
  - Thống kê tổng quan hệ thống:
    - Tổng số users (student, teacher, admin)
    - Tổng số đề thi
    - Tổng số bài thi đã làm
    - Điểm trung bình toàn hệ thống
    - Biểu đồ thống kê

### 4.2. Quản lý người dùng
- **Route**: `/admin/users`
- **Endpoints**:
  - `GET /api/users` - Lấy danh sách users
  - `GET /api/users/:id` - Xem chi tiết user
  - `POST /api/users` - Tạo user mới
  - `PATCH /api/users/:id` - Cập nhật user
  - `DELETE /api/users/:id` - Xóa user
- **Chức năng**:
  - Xem danh sách tất cả users
  - Lọc theo role (student, teacher, admin)
  - Tìm kiếm user
  - Tạo user mới
  - Cập nhật thông tin user
  - Xóa user
  - Xem thống kê user

### 4.3. Quản lý đề thi
- **Route**: `/admin/exams`
- **Chức năng**:
  - Xem tất cả đề thi trong hệ thống
  - Lọc theo giáo viên tạo
  - Xem chi tiết đề thi
  - Xóa đề thi (nếu cần)
  - Quản lý trạng thái đề thi

### 4.4. Báo cáo và thống kê
- **Route**: `/admin/reports`
- **Chức năng**:
  - Thống kê tổng hợp:
    - Số lượng users theo role
    - Số lượng đề thi
    - Số lượng bài thi đã làm
    - Điểm trung bình theo đề thi
    - Điểm trung bình theo user
  - Biểu đồ và đồ thị
  - Xuất báo cáo (Excel, PDF - nếu có)

### 4.5. Cài đặt hệ thống
- **Route**: `/admin/settings`
- **Chức năng**:
  - Cấu hình hệ thống
  - Quản lý cài đặt chung
  - Cấu hình email (nếu có)
  - Cấu hình thông báo

### 4.6. Quản lý profile
- **Route**: `/admin/profile`
- **Chức năng**:
  - Xem và cập nhật thông tin cá nhân
  - Đổi mật khẩu

---

## 🔄 5. TÍNH NĂNG REAL-TIME (SOCKET.IO)

### 5.1. Authentication Socket.IO
- Xác thực JWT token khi kết nối
- Lưu thông tin user session
- Quản lý kết nối/ngắt kết nối

### 5.2. Events từ Client (Student)
- `joinExam` - Tham gia phòng thi
- `leaveExam` - Rời phòng thi
- `examStarted` - Bắt đầu làm bài
- `submitAnswer` - Nộp câu trả lời
- `examCompleted` - Hoàn thành bài thi
- `timeUpdate` - Cập nhật thời gian
- `suspiciousActivity` - Báo cáo hoạt động đáng ngờ

### 5.3. Events từ Client (Teacher)
- `startMonitoring` - Bắt đầu giám sát bài thi

### 5.4. Events từ Server
- `userJoinedExam` - Thông báo user tham gia phòng thi
- `userLeftExam` - Thông báo user rời phòng thi
- `examStarted` - Thông báo bắt đầu làm bài
- `answerSubmitted` - Thông báo nộp câu trả lời
- `examCompleted` - Thông báo hoàn thành bài thi
- `examStats` - Thống kê phòng thi real-time
- `suspiciousActivity` - Cảnh báo hoạt động đáng ngờ
- `notification` - Thông báo chung
- `userStatus` - Trạng thái user (online/offline)

### 5.5. Real-time Notifications
- Component `RealTimeNotification` hiển thị thông báo
- Tự động hiển thị khi có sự kiện
- Hỗ trợ nhiều loại thông báo

---

## 📊 6. CHỨC NĂNG QUẢN LÝ DỮ LIỆU

### 6.1. Models (Database Schema)
- **User Model**:
  - name, email, password (hashed)
  - role (student, teacher, admin)
  - createdAt, updatedAt
  
- **Exam Model**:
  - name, description
  - duration (phút)
  - startDate, endDate
  - status (draft, scheduled, active, completed)
  - questions (array)
  - createdBy (reference to User)
  
- **Result Model**:
  - exam (reference to Exam)
  - user (reference to User)
  - answers (array)
  - score, totalQuestions, correctAnswers
  - startTime, endTime, duration
  - status (in_progress, completed, timeout)

### 6.2. Validation
- Input validation middleware
- Email format validation
- Password strength validation
- File upload validation (Excel/CSV)
- Data sanitization

### 6.3. Error Handling
- Centralized error handler
- Custom error messages
- HTTP status codes chuẩn
- Error logging (development)

---

## 🔒 7. BẢO MẬT

### 7.1. Authentication & Authorization
- JWT token authentication
- Password hashing với bcryptjs (12 rounds)
- Protected routes với middleware
- Role-based access control (RBAC)

### 7.2. Security Features
- CORS configuration
- Input validation và sanitization
- File upload security (type, size limits)
- SQL injection prevention (MongoDB)
- XSS protection

---

## 🎨 8. GIAO DIỆN NGƯỜI DÙNG

### 8.1. Components chung
- **Header**: Navigation, user menu, logout
- **Footer**: Thông tin footer
- **Alert**: Thông báo lỗi/thành công
- **Button**: Nút bấm chuẩn
- **Card**: Card hiển thị
- **Input**: Input form
- **Loading**: Spinner loading
- **Modal**: Popup modal
- **ProfileForm**: Form profile
- **ChangePasswordForm**: Form đổi mật khẩu
- **RealTimeNotification**: Thông báo real-time

### 8.2. Components cho Teacher
- **ExamForm**: Form tạo/sửa đề thi
- **ExamList**: Danh sách đề thi
- **ImportExcel**: Import Excel component

### 8.3. Styling
- Tailwind CSS framework
- Responsive design
- Modern UI
- Consistent design

---

## 📝 TỔNG KẾT

### Số lượng chức năng:
- **Authentication**: 4 chức năng
- **Student**: 7 chức năng chính
- **Teacher**: 10 chức năng chính
- **Admin**: 6 chức năng chính
- **Real-time**: 5 nhóm events
- **Tổng cộng**: ~32+ chức năng chính

### API Endpoints:
- **Auth**: 4 endpoints
- **Exams**: 7 endpoints
- **Results**: 5 endpoints
- **Users**: 7 endpoints
- **Tổng cộng**: ~23 endpoints

### Socket.IO Events:
- **Client to Server**: 8 events
- **Server to Client**: 8+ events
- **Tổng cộng**: 16+ events

### Pages/Routes:
- **Public**: 3 pages (Landing, Login, Register)
- **Student**: 7 pages
- **Teacher**: 9 pages
- **Admin**: 6 pages
- **Tổng cộng**: ~25 pages

---

## 🚀 CÁC TÍNH NĂNG NỔI BẬT

1. ✅ **Real-time Monitoring**: Giáo viên giám sát bài thi theo thời gian thực
2. ✅ **Import Excel**: Import hàng loạt câu hỏi từ Excel/CSV
3. ✅ **Role-based Access Control**: Phân quyền rõ ràng cho 3 vai trò
4. ✅ **Socket.IO Integration**: Real-time communication đầy đủ
5. ✅ **Responsive Design**: Giao diện đẹp, responsive
6. ✅ **Anti-cheating Detection**: Phát hiện hoạt động đáng ngờ
7. ✅ **Comprehensive Statistics**: Thống kê chi tiết và đầy đủ
8. ✅ **User Management**: Quản lý users toàn diện (Admin)
9. ✅ **Exam Management**: Quản lý đề thi linh hoạt
10. ✅ **Result Tracking**: Theo dõi kết quả chi tiết

---

*Tài liệu này được tạo tự động dựa trên codebase hiện tại. Cập nhật lần cuối: 2024*

