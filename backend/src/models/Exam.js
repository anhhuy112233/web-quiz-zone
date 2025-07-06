// Import thư viện mongoose
import mongoose from 'mongoose';

// Schema cho từng câu hỏi trong bài thi
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Vui lòng nhập câu hỏi'],
    trim: true  // Loại bỏ khoảng trắng đầu cuối
  },
  options: [{
    type: String,
    required: [true, 'Vui lòng nhập các lựa chọn'],
    trim: true  // Loại bỏ khoảng trắng đầu cuối
  }],
  correctAnswer: {
    type: Number,
    required: [true, 'Vui lòng chọn đáp án đúng'],
    min: 0,  // Đáp án A (index 0)
    max: 3   // Đáp án D (index 3)
  },
  explanation: {
    type: String,
    trim: true  // Giải thích đáp án (không bắt buộc)
  }
});

// Schema chính cho bài thi
const examSchema = new mongoose.Schema({
  // Thông tin cơ bản của bài thi
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề bài thi'],
    trim: true
  },
  description: {
    type: String,
    trim: true  // Mô tả bài thi (không bắt buộc)
  },
  duration: {
    type: Number,
    required: [true, 'Vui lòng nhập thời gian làm bài (phút)'],
    min: [1, 'Thời gian làm bài phải lớn hơn 0']
  },
  totalQuestions: {
    type: Number,
    required: [true, 'Vui lòng nhập số câu hỏi'],
    min: [1, 'Số câu hỏi phải lớn hơn 0']
  },
  questions: [questionSchema],  // Danh sách các câu hỏi
  
  // Thời gian thi
  startTime: {
    type: Date,
    required: [true, 'Vui lòng nhập thời gian bắt đầu']
  },
  endTime: {
    type: Date,
    required: [true, 'Vui lòng nhập thời gian kết thúc']
  },
  
  // Thông tin người tạo
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference đến model User
    required: true
  },
  
  // Trạng thái bài thi
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'completed'],  // Nháp, đã lên lịch, đang diễn ra, đã kết thúc
    default: 'draft'
  },
  
  // Danh sách người tham gia
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Có phải bài thi công khai không
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true  // Tự động thêm createdAt và updatedAt
});

// Tạo index để tối ưu hiệu suất query
examSchema.index({ startTime: 1, endTime: 1 });  // Index cho thời gian thi
examSchema.index({ status: 1 });                 // Index cho trạng thái
examSchema.index({ createdBy: 1 });              // Index cho người tạo

// Tạo model Exam từ schema
const Exam = mongoose.model('Exam', examSchema);

export default Exam; 