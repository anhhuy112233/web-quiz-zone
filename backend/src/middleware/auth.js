// Import các thư viện cần thiết
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware bảo vệ route - kiểm tra authentication
 * Sử dụng để bảo vệ các route yêu cầu đăng nhập
 */
export const protect = async (req, res, next) => {
  try {
    // 1) Kiểm tra token trong header Authorization
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Lấy token từ "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
    }

    // Nếu không có token, trả về lỗi
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.'
      });
    }

    // 2) Verify token - kiểm tra tính hợp lệ của token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Kiểm tra user có tồn tại trong database không
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Token không hợp lệ hoặc đã hết hạn.'
      });
    }

    // 4) Gán thông tin user vào request để sử dụng ở các middleware tiếp theo
    req.user = user;
    next();  // Chuyển sang middleware tiếp theo
  } catch (error) {
    // Xử lý lỗi khi verify token thất bại
    return res.status(401).json({
      status: 'error',
      message: 'Token không hợp lệ hoặc đã hết hạn.'
    });
  }
};

/**
 * Middleware kiểm tra quyền truy cập - chỉ cho phép các role được chỉ định
 * @param {...string} roles - Danh sách các role được phép truy cập
 * @returns {Function} Middleware function
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Kiểm tra xem có thông tin user không (phải gọi protect trước)
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        status: 'error',
        message: 'Không tìm thấy thông tin người dùng.'
      });
    }

    // Kiểm tra role của user có trong danh sách được phép không
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền thực hiện hành động này.'
      });
    }
    next();  // Cho phép truy cập nếu có quyền
  };
}; 