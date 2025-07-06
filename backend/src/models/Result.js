// Import thư viện mongoose
import mongoose from 'mongoose';

// Schema cho từng câu trả lời của học sinh
const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true  // ID của câu hỏi
  },
  selectedAnswer: {
    type: Number,
    required: true,
    min: 0,  // Đáp án A (index 0)
    max: 3   // Đáp án D (index 3)
  },
  isCorrect: {
    type: Boolean,
    required: true  // Đáp án có đúng hay không
  }
});

// Schema chính cho kết quả bài thi
const resultSchema = new mongoose.Schema({
  // Thông tin bài thi và người làm
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',  // Reference đến model Exam
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference đến model User
    required: true
  },
  
  // Chi tiết câu trả lời
  answers: [answerSchema],  // Danh sách các câu trả lời
  
  // Thống kê kết quả
  score: {
    type: Number,
    required: true,
    min: 0  // Điểm số (có thể là 0)
  },
  totalQuestions: {
    type: Number,
    required: true  // Tổng số câu hỏi
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0  // Số câu trả lời đúng
  },
  
  // Thời gian làm bài
  startTime: {
    type: Date,
    required: true  // Thời gian bắt đầu làm bài
  },
  endTime: {
    type: Date,
    required: true  // Thời gian kết thúc làm bài
  },
  duration: {
    type: Number, // Thời gian làm bài tính bằng phút
    required: true
  },
  
  // Trạng thái bài thi
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'timeout'],  // Đang làm, đã hoàn thành, hết thời gian
    default: 'in_progress'
  }
}, {
  timestamps: true  // Tự động thêm createdAt và updatedAt
});

// Tạo index để tối ưu hiệu suất query
resultSchema.index({ exam: 1, user: 1 });        // Index cho exam và user
resultSchema.index({ user: 1, createdAt: -1 });  // Index cho user và thời gian tạo (giảm dần)
resultSchema.index({ exam: 1, score: -1 });      // Index cho exam và điểm số (giảm dần)

// Tạo model Result từ schema
const Result = mongoose.model('Result', resultSchema);

export default Result; 