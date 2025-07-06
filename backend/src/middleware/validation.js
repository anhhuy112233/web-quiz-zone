// Import các utility và constants cần thiết
import { validationError } from '../utils/response.js';        // Utility để trả về lỗi validation
import { VALIDATION_MESSAGES } from '../constants/index.js';   // Các message validation chuẩn

/**
 * Middleware validate các trường bắt buộc
 * Kiểm tra xem các trường required có được cung cấp trong request body không
 * @param {string[]} fields - Mảng tên các trường bắt buộc
 * @returns {Function} Middleware function
 */
export const validateRequired = (fields) => {
  return (req, res, next) => {
    // Tìm các trường bị thiếu trong request body
    const missingFields = fields.filter(field => !req.body[field]);
    
    // Nếu có trường bị thiếu, trả về lỗi
    if (missingFields.length > 0) {
      const message = `Các trường sau là bắt buộc: ${missingFields.join(', ')}`;
      return validationError(res, message);
    }
    
    // Nếu tất cả trường đều có, chuyển sang middleware tiếp theo
    next();
  };
};

/**
 * Middleware validate định dạng email
 * Kiểm tra email có đúng format chuẩn không
 */
export const validateEmail = (req, res, next) => {
  const email = req.body.email;
  // Regex pattern để kiểm tra format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Nếu có email và không đúng format, trả về lỗi
  if (email && !emailRegex.test(email)) {
    return validationError(res, VALIDATION_MESSAGES.INVALID_EMAIL);
  }
  
  // Nếu email hợp lệ hoặc không có email, chuyển tiếp
  next();
};

/**
 * Middleware validate độ mạnh của mật khẩu
 * Kiểm tra mật khẩu có đủ độ dài tối thiểu không
 */
export const validatePassword = (req, res, next) => {
  const password = req.body.password;
  
  // Kiểm tra mật khẩu phải có ít nhất 6 ký tự
  if (password && password.length < 6) {
    return validationError(res, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH);
  }
  
  // Nếu mật khẩu hợp lệ hoặc không có mật khẩu, chuyển tiếp
  next();
};

/**
 * Middleware validate format ObjectId của MongoDB
 * Kiểm tra ID có đúng format 24 ký tự hex không
 * @param {string} paramName - Tên parameter cần validate (ví dụ: 'id', 'examId')
 * @returns {Function} Middleware function
 */
export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    // Regex pattern cho MongoDB ObjectId (24 ký tự hex)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    
    // Nếu có ID và không đúng format, trả về lỗi
    if (id && !objectIdRegex.test(id)) {
      return validationError(res, 'ID không hợp lệ');
    }
    
    // Nếu ID hợp lệ hoặc không có ID, chuyển tiếp
    next();
  };
};

/**
 * Middleware validate tham số phân trang
 * Kiểm tra và chuẩn hóa các tham số page và limit
 */
export const validatePagination = (req, res, next) => {
  // Lấy tham số từ query, mặc định page=1, limit=10
  const { page = 1, limit = 10 } = req.query;
  
  // Chuyển đổi sang số nguyên
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  // Kiểm tra tính hợp lệ của tham số phân trang
  // page phải >= 1, limit phải >= 1 và <= 100
  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    return validationError(res, 'Tham số phân trang không hợp lệ');
  }
  
  // Cập nhật lại query với giá trị đã validate
  req.query.page = pageNum;
  req.query.limit = limitNum;
  
  // Chuyển sang middleware tiếp theo
  next();
};

/**
 * Middleware validate file upload
 * Kiểm tra xem có file được upload không
 */
export const validateFileUpload = (req, res, next) => {
  // Kiểm tra có file trong request không
  if (!req.file) {
    return validationError(res, 'Vui lòng chọn file để upload');
  }
  
  // Nếu có file, chuyển sang middleware tiếp theo
  next();
}; 