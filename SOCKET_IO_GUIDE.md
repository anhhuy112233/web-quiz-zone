# Socket.IO Integration Guide - QuizZone

## Tổng quan

QuizZone đã được tích hợp Socket.IO để cung cấp tính năng real-time cho hệ thống thi trực tuyến. Tính năng này cho phép:

- **Real-time monitoring**: Giáo viên có thể giám sát bài thi theo thời gian thực
- **Live notifications**: Thông báo tức thì về các sự kiện trong bài thi
- **Anti-cheating alerts**: Phát hiện hoạt động đáng ngờ
- **Live statistics**: Thống kê cập nhật theo thời gian thực

## Cài đặt

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

## Cấu trúc Socket.IO

### Backend (`backend/src/socket.js`)

#### SocketManager Class
- Quản lý tất cả kết nối Socket.IO
- Xử lý authentication với JWT
- Quản lý phòng thi (exam rooms)
- Broadcast events cho các role khác nhau

#### Events được hỗ trợ:

**Student Events:**
- `joinExam` - Tham gia phòng thi
- `leaveExam` - Rời phòng thi
- `examStarted` - Bắt đầu làm bài
- `submitAnswer` - Nộp câu trả lời
- `examCompleted` - Hoàn thành bài thi
- `timeUpdate` - Cập nhật thời gian
- `suspiciousActivity` - Báo cáo hoạt động đáng ngờ

**Teacher Events:**
- `startMonitoring` - Bắt đầu giám sát bài thi

**Server Events:**
- `userJoinedExam` - User tham gia phòng thi
- `userLeftExam` - User rời phòng thi
- `examStats` - Thống kê phòng thi
- `notification` - Thông báo chung
- `userStatus` - Trạng thái user

### Frontend (`frontend/src/utils/socket.js`)

#### SocketClient Class
- Singleton pattern để quản lý kết nối
- Auto-reconnection với exponential backoff
- Authentication với token từ session manager
- Event handling và cleanup

## Sử dụng

### 1. Kết nối Socket.IO

Socket.IO sẽ tự động kết nối khi user đăng nhập:

```javascript
// Trong App.jsx
useEffect(() => {
  if (user) {
    const socket = socketClient.connect();
  } else {
    socketClient.disconnect();
  }
}, [user]);
```

### 2. Giám sát bài thi (Giáo viên)

Truy cập trang giám sát: `/teacher/exams/:examId/monitor`

```javascript
// Trong Monitor.jsx
const startMonitoring = () => {
  socketClient.joinExam(examId);
  socketClient.startMonitoring(examId);
  setIsMonitoring(true);
};
```

### 3. Làm bài thi (Học sinh)

```javascript
// Trong ExamStart.jsx
const handleSelect = (qIdx, optIdx) => {
  // Báo cáo câu trả lời cho giáo viên
  socketClient.submitAnswer(examId, questionId, answer, timeSpent);
};

const handleSubmit = async () => {
  // Báo cáo hoàn thành bài thi
  socketClient.examCompleted(examId, score, totalQuestions, timeTaken);
};
```

### 4. Phát hiện gian lận

```javascript
// Phát hiện chuyển tab
const handleVisibilityChange = () => {
  if (document.hidden && examStarted) {
    socketClient.suspiciousActivity(examId, 'Tab switching', 'Student switched to another tab');
  }
};

// Phát hiện refresh/đóng trang
const handleBeforeUnload = () => {
  socketClient.suspiciousActivity(examId, 'Page refresh/close', 'Student tried to refresh or close the page');
};
```

## Real-time Notifications

Component `RealTimeNotification` hiển thị thông báo real-time:

```javascript
// Tự động hiển thị khi có sự kiện
socketClient.on('examCompleted', (data) => {
  // Hiển thị notification
});
```

## API Endpoints

### Backend
- `GET /api/stats` - Lấy thống kê hệ thống real-time

## Tính năng bảo mật

### Authentication
- Mọi kết nối Socket.IO đều yêu cầu JWT token
- Token được verify trên server trước khi cho phép kết nối

### Anti-cheating
- Phát hiện chuyển tab
- Phát hiện refresh/đóng trang
- Theo dõi thời gian làm bài
- Báo cáo hoạt động đáng ngờ

### Rate Limiting
- Giới hạn số lượng events từ client
- Timeout cho các kết nối không hoạt động

## Monitoring Dashboard

Trang giám sát cung cấp:

1. **Danh sách học sinh đang thi**
   - Tên học sinh
   - Thời gian tham gia
   - Trạng thái (đang làm/đã hoàn thành)
   - Điểm số

2. **Hoạt động real-time**
   - Log tất cả sự kiện
   - Phân loại theo loại (info/warning/error)
   - Timestamp cho mỗi sự kiện

3. **Thống kê chi tiết**
   - Số học sinh đang thi
   - Số học sinh đã hoàn thành
   - Số học sinh đang làm bài
   - Số học sinh chờ bắt đầu

## Troubleshooting

### Kết nối thất bại
1. Kiểm tra backend server đang chạy
2. Kiểm tra CORS configuration
3. Kiểm tra JWT token hợp lệ

### Events không nhận được
1. Kiểm tra event name đúng
2. Kiểm tra room đã join chưa
3. Kiểm tra authentication

### Performance Issues
1. Giới hạn số lượng notifications hiển thị
2. Cleanup event listeners khi component unmount
3. Sử dụng debounce cho frequent events

## Development

### Testing Socket.IO
```javascript
// Test connection
const socket = socketClient.connect();
console.log('Connected:', socket.connected);

// Test event emission
socketClient.joinExam('test-exam-id');

// Test event listening
socketClient.on('test-event', (data) => {
  console.log('Received:', data);
});
```

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('socket-debug', 'true');
```

## Production Deployment

### Environment Variables
```env
# Backend
NODE_ENV=production
SOCKET_CORS_ORIGIN=https://your-domain.com

# Frontend
VITE_SOCKET_URL=https://your-backend-domain.com
```

### Scaling
- Sử dụng Redis adapter cho multiple server instances
- Implement load balancing
- Monitor Socket.IO performance metrics

## Tương lai

### Planned Features
- Screen sharing detection
- Proctoring with webcam
- AI-powered cheating detection
- Real-time chat support
- Collaborative exam features 