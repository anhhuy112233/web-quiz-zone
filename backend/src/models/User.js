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

// Tạo model User từ schema
const User = mongoose.model('User', userSchema);

export default User; 