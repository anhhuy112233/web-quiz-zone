import { io } from 'socket.io-client';
import sessionManager from './sessionManager.js';

class SocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // Kết nối đến Socket.IO server
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

      this.socket = io('http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 20000
      });

      this.setupEventHandlers();
      return this.socket;
    } catch (error) {
      console.error('Failed to connect to Socket.IO server:', error);
      return null;
    }
  }

  // Thiết lập các event handlers
  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to Socket.IO server after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket.IO reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket.IO reconnection failed');
    });
  }

  // Ngắt kết nối
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Tham gia phòng thi
  joinExam(examId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinExam', examId);
      console.log(`Joined exam room: ${examId}`);
    }
  }

  // Rời phòng thi
  leaveExam(examId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveExam', examId);
      console.log(`Left exam room: ${examId}`);
    }
  }

  // Bắt đầu làm bài
  examStarted(examId, startTime) {
    if (this.socket && this.isConnected) {
      this.socket.emit('examStarted', {
        examId: examId,
        startTime: startTime
      });
    }
  }

  // Nộp câu trả lời
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

  // Hoàn thành bài thi
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

  // Cập nhật thời gian
  timeUpdate(examId, remainingTime) {
    if (this.socket && this.isConnected) {
      this.socket.emit('timeUpdate', {
        examId: examId,
        remainingTime: remainingTime
      });
    }
  }

  // Báo cáo hoạt động đáng ngờ
  suspiciousActivity(examId, activity, details) {
    if (this.socket && this.isConnected) {
      this.socket.emit('suspiciousActivity', {
        examId: examId,
        activity: activity,
        details: details
      });
    }
  }

  // Bắt đầu giám sát (cho giáo viên)
  startMonitoring(examId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('startMonitoring', examId);
    }
  }

  // Lắng nghe sự kiện
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Hủy lắng nghe sự kiện
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Kiểm tra trạng thái kết nối
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