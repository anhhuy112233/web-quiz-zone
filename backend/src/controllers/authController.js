// Import các thư viện cần thiết
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Tạo JWT token cho user
 * @param {Object} user - Thông tin user
 * @returns {String} JWT token
 */
const signToken = (user) => {
  return jwt.sign({ 
    id: user._id, 
    name: user.name, 
    role: user.role 
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN  // Thời gian hết hạn token
  });
};

/**
 * Đăng ký tài khoản mới
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email đã được sử dụng.'
      });
    }

    // Tạo user mới
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student'  // Mặc định là student nếu không có role
    });

    // Tạo JWT token
    const token = signToken(user);

    // Ẩn password khỏi response
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Đăng nhập
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email và password có được cung cấp không
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Vui lòng cung cấp email và mật khẩu.'
      });
    }

    // Kiểm tra user có tồn tại và password có đúng không
    const user = await User.findOne({ email }).select('+password');  // +password để lấy password field
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Email hoặc mật khẩu không đúng.'
      });
    }

    // Cập nhật thời gian đăng nhập cuối
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });  // Không validate khi save

    // Tạo JWT token
    const token = signToken(user);

    // Ẩn password khỏi response
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Lấy thông tin user hiện tại
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    // req.user được set bởi middleware auth
    const user = await User.findById(req.user._id || req.user.id);
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Cập nhật mật khẩu
 * PATCH /api/auth/updatePassword
 */
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Lấy user từ database (bao gồm password field)
    const user = await User.findById(req.user._id || req.user.id).select('+password');

    // Kiểm tra mật khẩu hiện tại có đúng không
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        status: 'error',
        message: 'Mật khẩu hiện tại không đúng.'
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();  // Sẽ tự động hash password mới

    // Tạo token mới
    const token = signToken(user);

    res.status(200).json({
      status: 'success',
      token,
      message: 'Mật khẩu đã được cập nhật thành công.'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 