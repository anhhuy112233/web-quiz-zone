import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Vui lòng nhập câu hỏi'],
    trim: true
  },
  options: [{
    type: String,
    required: [true, 'Vui lòng nhập các lựa chọn'],
    trim: true
  }],
  correctAnswer: {
    type: Number,
    required: [true, 'Vui lòng chọn đáp án đúng'],
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    trim: true
  }
});

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề bài thi'],
    trim: true
  },
  description: {
    type: String,
    trim: true
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
  questions: [questionSchema],
  startTime: {
    type: Date,
    required: [true, 'Vui lòng nhập thời gian bắt đầu']
  },
  endTime: {
    type: Date,
    required: [true, 'Vui lòng nhập thời gian kết thúc']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'completed'],
    default: 'draft'
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
examSchema.index({ startTime: 1, endTime: 1 });
examSchema.index({ status: 1 });
examSchema.index({ createdBy: 1 });

const Exam = mongoose.model('Exam', examSchema);

export default Exam; 