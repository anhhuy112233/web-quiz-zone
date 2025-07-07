// Import các thư viện cần thiết
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

/**
 * Class quản lý Socket.IO cho hệ thống thi trực tuyến
 * Xử lý các kết nối real-time giữa client và server
 */
class SocketManager {
  constructor(server) {
    // Khởi tạo Socket.IO server với cấu hình CORS
    this.io = new Server(server, {
      cors: {
        origin: "http://localhost:3000",  // Cho phép frontend kết nối
        methods: ["GET", "POST"]
      }
    });
    
    // Lưu trữ thông tin các phòng thi và session của user
    this.examRooms = new Map(); // Lưu trữ các phòng thi
    this.userSessions = new Map(); // Lưu trữ session của user
    
    // Thiết lập middleware và event handlers
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Middleware để xác thực token JWT khi kết nối Socket.IO
   * Đảm bảo chỉ user đã đăng nhập mới có thể kết nối
   */
  setupMiddleware() {
    this.io.use((socket, next) => {
      // Lấy token từ handshake auth
      const token = socket.handshake.auth.token;
      
      console.log('Socket middleware - Token received:', !!token);
      
      // Kiểm tra có token không
      if (!token) {
        console.log('Socket middleware - No token provided');
        return next(new Error('Authentication error'));
      }

      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Socket middleware - JWT decoded:', decoded);
        
        // Gán thông tin user vào socket
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        socket.userName = decoded.name;
        
        console.log('Socket middleware - User authenticated:', {
          userId: socket.userId,
          userRole: socket.userRole,
          userName: socket.userName
        });
        
        // Kiểm tra nếu thông tin bị thiếu
        if (!socket.userName) {
          console.error('Socket middleware - userName is missing from JWT:', decoded);
        }
        if (!socket.userRole) {
          console.error('Socket middleware - userRole is missing from JWT:', decoded);
        }
        
        next();  // Cho phép kết nối
      } catch (error) {
        console.log('Socket middleware - Token verification failed:', error.message);
        return next(new Error('Authentication error'));
      }
    });
  }

  /**
   * Thiết lập các event handlers cho Socket.IO
   * Xử lý các sự kiện từ client
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userName} (${socket.userRole}) - Socket ID: ${socket.id}`);
      
      // Lưu thông tin user session
      this.userSessions.set(socket.id, {
        userId: socket.userId,
        userRole: socket.userRole,
        userName: socket.userName,
        connectedAt: new Date()
      });

      // Thông báo user online
      this.broadcastUserStatus(socket.userId, 'online');

      // Xử lý tham gia phòng thi
      socket.on('joinExam', (examId) => {
        console.log(`User ${socket.userName} joining exam: ${examId}`);
        this.handleJoinExam(socket, examId);
      });

      // Xử lý rời phòng thi
      socket.on('leaveExam', (examId) => {
        console.log(`User ${socket.userName} leaving exam: ${examId}`);
        this.handleLeaveExam(socket, examId);
      });

      // Xử lý bắt đầu làm bài
      socket.on('examStarted', (data) => {
        console.log(`User ${socket.userName} started exam:`, data);
        this.handleExamStarted(socket, data);
      });

      // Xử lý nộp câu trả lời
      socket.on('submitAnswer', (data) => {
        console.log(`User ${socket.userName} submitted answer:`, data);
        this.handleSubmitAnswer(socket, data);
      });

      // Xử lý hoàn thành bài thi
      socket.on('examCompleted', (data) => {
        console.log(`User ${socket.userName} completed exam:`, data);
        this.handleExamCompleted(socket, data);
      });

      // Xử lý cập nhật thời gian
      socket.on('timeUpdate', (data) => {
        console.log(`User ${socket.userName} time update:`, data);
        this.handleTimeUpdate(socket, data);
      });

      // Xử lý hoạt động đáng ngờ
      socket.on('suspiciousActivity', (data) => {
        console.log(`User ${socket.userName} suspicious activity:`, data);
        this.handleSuspiciousActivity(socket, data);
      });

      // Xử lý giám sát (cho giáo viên)
      socket.on('startMonitoring', (examId) => {
        console.log(`Teacher ${socket.userName} started monitoring exam: ${examId}`);
        this.handleStartMonitoring(socket, examId);
      });

      

      // Xử lý ngắt kết nối
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userName} (${socket.userRole})`);
        this.handleDisconnect(socket);
      });
    });
  }

  /**
   * Xử lý khi user tham gia phòng thi
   * @param {Object} socket - Socket instance
   * @param {String} examId - ID của bài thi
   */
  handleJoinExam(socket, examId) {
    const roomName = `exam_${examId}`;
    socket.join(roomName);  // Tham gia vào phòng Socket.IO
    
    console.log(`User ${socket.userName} joined room: ${roomName}`);
    
    // Tạo phòng thi mới nếu chưa tồn tại
    if (!this.examRooms.has(examId)) {
      this.examRooms.set(examId, {
        students: new Set(),  // Danh sách học sinh trong phòng
        teachers: new Set(),  // Danh sách giáo viên trong phòng
        startTime: null,      // Thời gian bắt đầu thi
        endTime: null         // Thời gian kết thúc thi
      });
      console.log(`Created new exam room: ${examId}`);
    }
    
    const examRoom = this.examRooms.get(examId);
    
    // Thêm user vào danh sách tương ứng theo role
    if (socket.userRole === 'student') {
      examRoom.students.add(socket.userId);
      console.log(`Student ${socket.userName} added to exam ${examId}. Total students: ${examRoom.students.size}`);
    } else if (socket.userRole === 'teacher') {
      examRoom.teachers.add(socket.userId);
      console.log(`Teacher ${socket.userName} added to exam ${examId}. Total teachers: ${examRoom.teachers.size}`);
    }

    // Thông báo cho tất cả trong phòng về user mới tham gia
    const eventData = {
      userId: socket.userId,
      userName: socket.userName,
      userRole: socket.userRole,
      examId: examId,
      timestamp: new Date()
    };
    
    console.log(`Broadcasting userJoinedExam to room ${roomName}:`, eventData);
    this.io.to(roomName).emit('userJoinedExam', eventData);

    // Cập nhật thống kê phòng thi
    this.updateExamStats(examId);
  }

  /**
   * Xử lý khi user rời phòng thi
   * @param {Object} socket - Socket instance
   * @param {String} examId - ID của bài thi
   */
  handleLeaveExam(socket, examId) {
    const roomName = `exam_${examId}`;
    socket.leave(roomName);  // Rời khỏi phòng Socket.IO
    
    console.log(`User ${socket.userName} left room: ${roomName}`);
    
    // Xóa user khỏi danh sách phòng thi
    const examRoom = this.examRooms.get(examId);
    if (examRoom) {
      if (socket.userRole === 'student') {
        examRoom.students.delete(socket.userId);
        console.log(`Student ${socket.userName} removed from exam ${examId}. Total students: ${examRoom.students.size}`);
      } else if (socket.userRole === 'teacher') {
        examRoom.teachers.delete(socket.userId);
        console.log(`Teacher ${socket.userName} removed from exam ${examId}. Total teachers: ${examRoom.teachers.size}`);
      }
    }

    const eventData = {
      userId: socket.userId,
      userName: socket.userName,
      userRole: socket.userRole,
      examId: examId,
      timestamp: new Date()
    };
    
    console.log(`Broadcasting userLeftExam to room ${roomName}:`, eventData);
    this.io.to(roomName).emit('userLeftExam', eventData);

    this.updateExamStats(examId);
  }

  /**
   * Xử lý khi user bắt đầu làm bài
   * @param {Object} socket - Socket instance
   * @param {Object} data - Dữ liệu bao gồm examId và startTime
   */
  handleExamStarted(socket, data) {
    const { examId, startTime } = data;
    const roomName = `exam_${examId}`;
    
    console.log(`Student ${socket.userName} started exam ${examId} at ${startTime}`);
    
    // Cập nhật thời gian bắt đầu
    const examRoom = this.examRooms.get(examId);
    if (examRoom) {
      examRoom.startTime = startTime;
    }

    // Thông báo cho giáo viên
    const eventData = {
      studentId: socket.userId,
      studentName: socket.userName,
      examId: examId,
      startTime: startTime,
      timestamp: new Date()
    };
    
    console.log(`Broadcasting examStarted to room ${roomName}:`, eventData);
    this.io.to(roomName).emit('examStarted', eventData);
    
    // Cập nhật thống kê
    this.updateExamStats(examId);
  }

  /**
   * Xử lý khi user nộp câu trả lời
   * @param {Object} socket - Socket instance
   * @param {Object} data - Dữ liệu bao gồm examId, questionId, answer và timeSpent
   */
  handleSubmitAnswer(socket, data) {
    const { examId, questionId, answer, timeSpent } = data;
    const roomName = `exam_${examId}`;

    console.log(`Student ${socket.userName} submitted answer for question ${questionId} in exam ${examId}`);

    // Thông báo cho giáo viên
    const eventData = {
      studentId: socket.userId,
      studentName: socket.userName,
      examId: examId,
      questionId: questionId,
      answer: answer,
      timeSpent: timeSpent,
      timestamp: new Date()
    };
    
    console.log(`Broadcasting answerSubmitted to room ${roomName}:`, eventData);
    this.io.to(roomName).emit('answerSubmitted', eventData);
  }

  /**
   * Xử lý khi user hoàn thành bài thi
   * @param {Object} socket - Socket instance
   * @param {Object} data - Dữ liệu bao gồm examId, score, totalQuestions và timeTaken
   */
  handleExamCompleted(socket, data) {
    const { examId, score, totalQuestions, timeTaken } = data;
    const roomName = `exam_${examId}`;

    console.log(`Student ${socket.userName} completed exam ${examId} with score ${score}/${totalQuestions}`);

    // Thông báo cho giáo viên
    const eventData = {
      studentId: socket.userId,
      studentName: socket.userName,
      examId: examId,
      score: score,
      totalQuestions: totalQuestions,
      timeTaken: timeTaken,
      timestamp: new Date()
    };
    
    console.log(`Broadcasting examCompleted to room ${roomName}:`, eventData);
    this.io.to(roomName).emit('examCompleted', eventData);

    // Cập nhật thống kê
    this.updateExamStats(examId);
  }

  /**
   * Xử lý khi có cập nhật thời gian cho bài thi
   * @param {Object} socket - Socket instance
   * @param {Object} data - Dữ liệu bao gồm examId và remainingTime
   */
  handleTimeUpdate(socket, data) {
    const { examId, remainingTime } = data;
    const roomName = `exam_${examId}`;

    console.log(`Time update for exam ${examId}: ${remainingTime} seconds remaining`);

    // Gửi thời gian còn lại cho học sinh
    const eventData = {
      examId: examId,
      remainingTime: remainingTime,
      timestamp: new Date()
    };
    
    socket.to(roomName).emit('timeUpdate', eventData);
  }

  /**
   * Xử lý khi phát hiện hoạt động đáng ngờ
   * @param {Object} socket - Socket instance
   * @param {Object} data - Dữ liệu bao gồm examId, activity và details
   */
  handleSuspiciousActivity(socket, data) {
    const { examId, activity, details } = data;
    const roomName = `exam_${examId}`;

    console.log(`Suspicious activity from ${socket.userName} in exam ${examId}: ${activity}`);

    // Thông báo cho giáo viên
    const eventData = {
      studentId: socket.userId,
      studentName: socket.userName,
      examId: examId,
      activity: activity,
      details: details,
      timestamp: new Date()
    };
    
    console.log(`Broadcasting suspiciousActivity to room ${roomName}:`, eventData);
    this.io.to(roomName).emit('suspiciousActivity', eventData);
  }

  /**
   * Xử lý khi giáo viên bắt đầu giám sát phòng thi
   * @param {Object} socket - Socket instance
   * @param {String} examId - ID của bài thi
   */
  handleStartMonitoring(socket, examId) {
    const roomName = `exam_${examId}`;
    
    console.log(`Teacher ${socket.userName} started monitoring exam ${examId}`);
    
    // Gửi thông tin hiện tại của phòng thi cho giáo viên
    const examRoom = this.examRooms.get(examId);
    if (examRoom) {
      // Gửi examStatus cho giáo viên cụ thể
      const statusData = {
        examId: examId,
        activeStudents: examRoom.students.size,
        startTime: examRoom.startTime,
        endTime: examRoom.endTime
      };
      
      console.log(`Sending examStatus to teacher ${socket.userName}:`, statusData);
      socket.emit('examStatus', statusData);
      
      // Gửi examStats cho toàn bộ phòng
      const statsData = {
        examId: examId,
        activeStudents: examRoom.students.size,
        activeTeachers: examRoom.teachers.size,
        startTime: examRoom.startTime,
        endTime: examRoom.endTime,
        timestamp: new Date()
      };
      
      console.log(`Broadcasting examStats to room ${roomName}:`, statsData);
      this.io.to(roomName).emit('examStats', statsData);
    } else {
      console.log(`No exam room found for exam ${examId}`);
    }
  }

  /**
   * Xử lý khi ngắt kết nối Socket.IO
   * @param {Object} socket - Socket instance
   */
  handleDisconnect(socket) {
    console.log(`User disconnected: ${socket.userName}`);
    
    // Xóa session
    this.userSessions.delete(socket.id);
    
    // Thông báo user offline
    this.broadcastUserStatus(socket.userId, 'offline');
    
    // Rời khỏi tất cả phòng thi
    this.examRooms.forEach((examRoom, examId) => {
      if (examRoom.students.has(socket.userId)) {
        examRoom.students.delete(socket.userId);
        console.log(`Student ${socket.userName} removed from exam ${examId} due to disconnect`);
        this.updateExamStats(examId);
      }
      if (examRoom.teachers.has(socket.userId)) {
        examRoom.teachers.delete(socket.userId);
        console.log(`Teacher ${socket.userName} removed from exam ${examId} due to disconnect`);
      }
    });
  }

  /**
   * Cập nhật thống kê phòng thi
   * @param {String} examId - ID của bài thi
   */
  updateExamStats(examId) {
    const examRoom = this.examRooms.get(examId);
    if (examRoom) {
      const roomName = `exam_${examId}`;
      
      const statsData = {
        examId: examId,
        activeStudents: examRoom.students.size,
        activeTeachers: examRoom.teachers.size,
        startTime: examRoom.startTime,
        endTime: examRoom.endTime,
        timestamp: new Date()
      };
      
      console.log(`Updating exam stats for ${examId}:`, statsData);
      this.io.to(roomName).emit('examStats', statsData);
    }
  }

  /**
   * Thông báo trạng thái user cho tất cả client
   * @param {String} userId - ID của user
   * @param {String} status - Trạng thái của user (online/offline)
   */
  broadcastUserStatus(userId, status) {
    const eventData = {
      userId: userId,
      status: status,
      timestamp: new Date()
    };
    
    console.log(`Broadcasting userStatus:`, eventData);
    this.io.emit('userStatus', eventData);
  }

  /**
   * Gửi thông báo cho tất cả client
   * @param {String} message - Nội dung thông báo
   * @param {String} type - Loại thông báo (info, success, warning, error)
   */
  broadcastNotification(message, type = 'info') {
    const eventData = {
      message: message,
      type: type,
      timestamp: new Date()
    };
    
    console.log(`Broadcasting notification:`, eventData);
    this.io.emit('notification', eventData);
  }

  /**
   * Gửi thông báo cho role cụ thể
   * @param {String} role - Role của user (student, teacher, admin)
   * @param {String} event - Tên sự kiện Socket.IO
   * @param {Object} data - Dữ liệu cần gửi
   */
  broadcastToRole(role, event, data) {
    const eventData = {
      ...data,
      targetRole: role,
      timestamp: new Date()
    };
    
    console.log(`Broadcasting to role ${role}:`, eventData);
    this.io.emit(event, eventData);
  }

  /**
   * Lấy thống kê hệ thống
   * @returns {Object} - Thống kê hiện tại
   */
  getSystemStats() {
    const stats = {
      connectedUsers: this.userSessions.size,
      activeExams: this.examRooms.size,
      totalStudents: Array.from(this.examRooms.values())
        .reduce((total, room) => total + room.students.size, 0),
      totalTeachers: Array.from(this.examRooms.values())
        .reduce((total, room) => total + room.teachers.size, 0)
    };
    
    console.log('System stats:', stats);
    return stats;
  }
}

export default SocketManager; 