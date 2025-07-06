// Import thư viện Socket.IO client và sessionManager
import { io } from 'socket.io-client';
import sessionManager from './sessionManager.js';

/**
 * Class quản lý kết nối Socket.IO client
 * Xử lý kết nối real-time với server
 */
class SocketClient {
  constructor() {
    this.socket = null;                    // Socket instance
    this.isConnected = false;              // Trạng thái kết nối
    this.reconnectAttempts = 0;            // Số lần thử kết nối lại
    this.maxReconnectAttempts = 5;         // Số lần thử tối đa
    this.reconnectDelay = 1000;            // Thời gian delay giữa các lần thử (ms)
  }

  /**
   * Kết nối đến Socket.IO server
   * @returns {Object|null} Socket instance hoặc null nếu thất bại
   */
  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const token = sessionManager.getCurrentToken();
    console.log('Socket.IO - Current token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      console.warn('No authentication token available for Socket.IO connection');
      return null;
    }

    try {
      // Decode token để debug
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('Socket.IO - Token payload:', payload);
        } catch (e) {
          console.log('Socket.IO - Could not decode token payload');
        }
      }

      // Socket.IO server URL - tự động chọn URL dựa trên environment
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 
        (import.meta.env.DEV ? 'http://localhost:5000' : 'https://web-quiz-zone.onrender.com');

      // Tạo kết nối Socket.IO với cấu hình
      this.socket = io(socketUrl, {
        auth: {
          token: token  // Gửi token để xác thực
        },
        transports: ['websocket', 'polling'],  // Ưu tiên websocket, fallback polling
        reconnection: true,                     // Tự động kết nối lại
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 20000  // Timeout 20 giây
      });

      this.setupEventHandlers();
      return this.socket;
    } catch (error) {
      console.error('Failed to connect to Socket.IO server:', error);
      return null;
    }
  }

  /**
   * Thiết lập các event handlers cho Socket.IO
   */
  setupEventHandlers() {
    if (!this.socket) return;

    // Xử lý khi kết nối thành công
    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    // Xử lý khi ngắt kết nối
    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason);
      this.isConnected = false;
    });

    // Xử lý lỗi kết nối
    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    // Xử lý khi kết nối lại thành công
    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to Socket.IO server after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    // Xử lý lỗi khi kết nối lại
    this.socket.on('reconnect_error', (error) => {
      console.error('Socket.IO reconnection error:', error);
    });

    // Xử lý khi kết nối lại thất bại hoàn toàn
    this.socket.on('reconnect_failed', () => {
      console.error('Socket.IO reconnection failed');
    });
  }

  /**
   * Ngắt kết nối Socket.IO
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Tham gia phòng thi
   * @param {String} examId - ID của bài thi
   */
  joinExam(examId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinExam', examId);
      console.log(`Joined exam room: ${examId}`);
    }
  }

  /**
   * Rời phòng thi
   * @param {String} examId - ID của bài thi
   */
  leaveExam(examId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveExam', examId);
      console.log(`Left exam room: ${examId}`);
    }
  }

  /**
   * Bắt đầu làm bài thi
   * @param {String} examId - ID của bài thi
   * @param {Date} startTime - Thời gian bắt đầu
   */
  examStarted(examId, startTime) {
    if (this.socket && this.isConnected) {
      this.socket.emit('examStarted', {
        examId: examId,
        startTime: startTime
      });
    }
  }

  /**
   * Nộp câu trả lời
   * @param {String} examId - ID của bài thi
   * @param {String} questionId - ID của câu hỏi
   * @param {Number} answer - Đáp án được chọn (0-3)
   * @param {Number} timeSpent - Thời gian làm câu hỏi (giây)
   */
  submitAnswer(examId, questionId, answer, timeSpent) {
    if (this.socket && this.isConnected) {
      this.socket.emit('submitAnswer', {
        examId: examId,
        questionId: questionId,
        answer: answer,
        timeSpent: timeSpent
      });
    }
  }

  /**
   * Hoàn thành bài thi
   * @param {String} examId - ID của bài thi
   * @param {Number} score - Điểm số
   * @param {Number} totalQuestions - Tổng số câu hỏi
   * @param {Number} timeTaken - Thời gian làm bài (phút)
   */
  examCompleted(examId, score, totalQuestions, timeTaken) {
    if (this.socket && this.isConnected) {
      this.socket.emit('examCompleted', {
        examId: examId,
        score: score,
        totalQuestions: totalQuestions,
        timeTaken: timeTaken
      });
    }
  }

  /**
   * Cập nhật thời gian còn lại
   * @param {String} examId - ID của bài thi
   * @param {Number} remainingTime - Thời gian còn lại (giây)
   */
  timeUpdate(examId, remainingTime) {
    if (this.socket && this.isConnected) {
      this.socket.emit('timeUpdate', {
        examId: examId,
        remainingTime: remainingTime
      });
    }
  }

  /**
   * Báo cáo hoạt động đáng ngờ
   * @param {String} examId - ID của bài thi
   * @param {String} activity - Loại hoạt động
   * @param {Object} details - Chi tiết hoạt động
   */
  suspiciousActivity(examId, activity, details) {
    if (this.socket && this.isConnected) {
      this.socket.emit('suspiciousActivity', {
        examId: examId,
        activity: activity,
        details: details
      });
    }
  }

  /**
   * Bắt đầu giám sát (cho giáo viên)
   * @param {String} examId - ID của bài thi
   */
  startMonitoring(examId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('startMonitoring', examId);
    }
  }

  /**
   * Lắng nghe sự kiện từ server
   * @param {String} event - Tên sự kiện
   * @param {Function} callback - Hàm xử lý sự kiện
   */
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Hủy lắng nghe sự kiện
   * @param {String} event - Tên sự kiện
   * @param {Function} callback - Hàm xử lý sự kiện
   */
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * Kiểm tra trạng thái kết nối
   * @returns {Boolean} true nếu đã kết nối, false nếu chưa
   */
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  // Lấy socket instance
  getSocket() {
    return this.socket;
  }
}

// Tạo instance singleton
const socketClient = new SocketClient();

export default socketClient; 