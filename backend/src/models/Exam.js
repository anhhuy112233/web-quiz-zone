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
  
  // Danh sách mã lớp (liên kết với Class)
  // Một đề thi có thể được gán cho nhiều lớp
  // Nếu có classIds, chỉ sinh viên trong các lớp đó mới thấy
  classIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  
  // Giữ lại classId để tương thích ngược (deprecated, sẽ xóa sau)
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null
  },
  
  // Trạng thái bài thi
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'completed'],  // Nháp, đã lên lịch, đang diễn ra, đã kết thúc
    default: 'draft'
  },
  
  // Trạng thái public (công khai)
  // Nếu public = true, sinh viên trong lớp có thể thấy và làm bài
  // Nếu public = false, chỉ giáo viên tạo mới thấy
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Cho phép thi nhiều lần hay chỉ thi một lần
  // Nếu allowMultipleAttempts = true: sinh viên có thể thi lại nhiều lần
  // Nếu allowMultipleAttempts = false: mỗi sinh viên chỉ được thi 1 lần duy nhất
  allowMultipleAttempts: {
    type: Boolean,
    default: true  // Mặc định cho phép thi nhiều lần
  },
  
  // Danh sách người tham gia
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true  // Tự động thêm createdAt và updatedAt
});

// Tạo index để tối ưu hiệu suất query
examSchema.index({ startTime: 1, endTime: 1 });  // Index cho thời gian thi
examSchema.index({ status: 1 });                 // Index cho trạng thái
examSchema.index({ createdBy: 1 });              // Index cho người tạo
examSchema.index({ classIds: 1 });               // Index cho danh sách lớp
examSchema.index({ classId: 1 });                // Index cho lớp (tương thích ngược)
examSchema.index({ classIds: 1, isPublic: 1 }); // Index cho danh sách lớp và trạng thái public
examSchema.index({ createdBy: 1, classIds: 1 }); // Index cho người tạo và danh sách lớp

// Tạo model Exam từ schema
const Exam = mongoose.model('Exam', examSchema);

export default Exam; 