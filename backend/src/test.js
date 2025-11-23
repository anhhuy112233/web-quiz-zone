// backend/src/socket.js
import { Server } from 'socket.io';

class SocketManager {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      socket.on('joinExam', (examId) => {
        socket.join(examId);
      });

      socket.on('submitAnswer', (data) => {
        // Gửi thông báo realtime cho giáo viên hoặc admin
        this.io.to(data.examId).emit('answerSubmitted', data);
      });
    });
  }
}
export default SocketManager;