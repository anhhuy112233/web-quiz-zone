// Import thư viện mongoose
import mongoose from 'mongoose';

// Schema cho Class (Lớp học)
const classSchema = new mongoose.Schema({
  // Mã lớp (unique)
  classCode: {
    type: String,
    required: [true, 'Vui lòng nhập mã lớp'],
    unique: true,
    trim: true,
    uppercase: true // Chuyển thành chữ hoa
  },
  
  // Tên lớp
  className: {
    type: String,
    required: [true, 'Vui lòng nhập tên lớp'],
    trim: true
  },
  
  // Mô tả lớp
  description: {
    type: String,
    trim: true
  },
  
  // Giáo viên chủ nhiệm (có thể có nhiều giáo viên)
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Số lượng sinh viên tối đa
  maxStudents: {
    type: Number,
    default: 50
  },
  
  // Trạng thái lớp
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

// Tạo index để tối ưu hiệu suất query
classSchema.index({ classCode: 1 }); // Index cho mã lớp
classSchema.index({ status: 1 }); // Index cho trạng thái

// Tạo model Class từ schema
const Class = mongoose.model('Class', classSchema);

export default Class;

