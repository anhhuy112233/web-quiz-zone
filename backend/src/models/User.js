// Import các thư viện cần thiết
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

// Định nghĩa schema cho User model
const userSchema = new mongoose.Schema({
  // Thông tin cá nhân
  name: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên'],
    trim: true  // Loại bỏ khoảng trắng đầu cuối
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,  // Email phải là duy nhất
    lowercase: true,  // Chuyển về chữ thường
    validate: [validator.isEmail, 'Email không hợp lệ']  // Validate email format
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false  // Không trả về password khi query
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],  // Chỉ cho phép 3 role này
    default: 'student'  // Mặc định là student
  },
  
  // Mã sinh viên (unique, chỉ cho student)
  studentId: {
    type: String,
    unique: true,
    sparse: true, // Cho phép null nhưng nếu có thì phải unique
    trim: true,
    uppercase: true
  },
  
  // Mã giáo viên (unique, chỉ cho teacher)
  teacherId: {
    type: String,
    unique: true,
    sparse: true, // Cho phép null nhưng nếu có thì phải unique
    trim: true,
    uppercase: true
  },
  
  // Mã lớp (liên kết với Class, chỉ cho student)
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null
  },
  
  createdAt: {
    type: Date,
    default: Date.now  // Tự động set thời gian tạo
  },
  lastLogin: {
    type: Date  // Thời gian đăng nhập cuối cùng
  }
}, {
  timestamps: true  // Tự động thêm createdAt và updatedAt
});

// Middleware: Hash password trước khi lưu vào database
userSchema.pre('save', async function(next) {
  // Chỉ hash password khi password được thay đổi
  if (!this.isModified('password')) return next();
  
  // Hash password với salt rounds = 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method để so sánh password (dùng khi login)
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Validation: Kiểm tra studentId và teacherId phù hợp với role
// Chỉ validate khi tạo mới hoặc khi role được thay đổi
userSchema.pre('save', function(next) {
  // Chỉ validate khi tạo mới (isNew) hoặc khi role/studentId/teacherId/classId được thay đổi
  if (this.isNew || this.isModified('role') || this.isModified('studentId') || 
      this.isModified('teacherId') || this.isModified('classId')) {
    
    // Admin không cần studentId, teacherId, classId
    if (this.role === 'admin') {
      this.studentId = undefined;
      this.teacherId = undefined;
      this.classId = undefined;
      return next();
    }
    
    // Student phải có studentId (có thể thêm sau khi tạo)
    // Không bắt buộc ngay khi tạo để linh hoạt
    // if (this.role === 'student' && !this.studentId) {
    //   return next(new Error('Sinh viên phải có mã sinh viên (studentId)'));
    // }
    
    // Teacher phải có teacherId (có thể thêm sau khi tạo)
    // if (this.role === 'teacher' && !this.teacherId) {
    //   return next(new Error('Giáo viên phải có mã giáo viên (teacherId)'));
    // }
    
    // Student không bắt buộc phải có classId ngay (có thể gán sau)
    // if (this.role === 'student' && !this.classId) {
    //   return next(new Error('Sinh viên phải thuộc về một lớp (classId)'));
    // }
  }
  next();
});

// Tạo index để tối ưu hiệu suất query
userSchema.index({ studentId: 1 });
userSchema.index({ teacherId: 1 });
userSchema.index({ classId: 1 });
userSchema.index({ role: 1, classId: 1 });

// Tạo model User từ schema
const User = mongoose.model('User', userSchema);

export default User; 