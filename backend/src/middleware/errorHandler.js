// Import các utility và constants cần thiết
import { errorResponse } from '../utils/response.js';        // Utility để trả về response lỗi
import { HTTP_STATUS } from '../constants/index.js';        // Các mã HTTP status code

/**
 * Middleware xử lý lỗi toàn cục
 * Bắt và xử lý tất cả các lỗi xảy ra trong ứng dụng
 * @param {Error} err - Đối tượng lỗi
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const errorHandler = (err, req, res, next) => {
  // Tạo bản sao của lỗi để không làm thay đổi lỗi gốc
  let error = { ...err };
  error.message = err.message;

  // Log chi tiết lỗi để debug (chỉ trong development)
  console.error('Error:', {
    message: err.message,           // Nội dung lỗi
    stack: err.stack,              // Stack trace
    url: req.url,                  // URL gây lỗi
    method: req.method,            // HTTP method
    body: req.body,                // Request body
    params: req.params,            // URL parameters
    query: req.query,              // Query parameters
    user: req.user?.id             // ID user (nếu có)
  });

  // Xử lý lỗi Mongoose - ObjectId không hợp lệ
  if (err.name === 'CastError') {
    const message = 'ID không hợp lệ';
    error = { message, statusCode: HTTP_STATUS.BAD_REQUEST };
  }

  // Xử lý lỗi Mongoose - Duplicate key (trùng lặp dữ liệu)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];  // Lấy tên field bị trùng
    const message = `${field} đã tồn tại`;
    error = { message, statusCode: HTTP_STATUS.BAD_REQUEST };
  }

  // Xử lý lỗi Mongoose - Validation error (lỗi validate schema)
  if (err.name === 'ValidationError') {
    // Gộp tất cả message lỗi validation thành một chuỗi
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: HTTP_STATUS.BAD_REQUEST };
  }

  // Xử lý lỗi JWT - Token không hợp lệ
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token không hợp lệ';
    error = { message, statusCode: HTTP_STATUS.UNAUTHORIZED };
  }

  // Xử lý lỗi JWT - Token đã hết hạn
  if (err.name === 'TokenExpiredError') {
    const message = 'Token đã hết hạn';
    error = { message, statusCode: HTTP_STATUS.UNAUTHORIZED };
  }

  // Xử lý lỗi Multer - File quá lớn
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File quá lớn. Kích thước tối đa là 5MB';
    error = { message, statusCode: HTTP_STATUS.BAD_REQUEST };
  }

  // Xử lý lỗi Multer - File không được hỗ trợ
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'File không được hỗ trợ';
    error = { message, statusCode: HTTP_STATUS.BAD_REQUEST };
  }

  // Trả về response lỗi với thông tin chi tiết (chỉ trong development)
  return errorResponse(
    res,
    error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,  // Status code mặc định 500
    error.message || 'Có lỗi xảy ra trên server',          // Message mặc định
    process.env.NODE_ENV === 'development' ? err : null     // Chi tiết lỗi chỉ trong dev
  );
};

/**
 * Middleware xử lý route không tồn tại (404)
 * Được gọi khi không tìm thấy route nào khớp với request
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const notFound = (req, res, next) => {
  // Tạo lỗi 404 với thông tin route không tìm thấy
  const error = new Error(`Không tìm thấy route: ${req.originalUrl}`);
  error.statusCode = HTTP_STATUS.NOT_FOUND;
  // Chuyển lỗi cho errorHandler middleware xử lý
  next(error);
};

/**
 * Wrapper function để xử lý async/await errors
 * Bọc các async function để tự động catch lỗi và chuyển cho errorHandler
 * @param {Function} fn - Async function cần wrap
 * @returns {Function} Wrapped function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    // Wrap async function trong Promise.resolve để đảm bảo luôn trả về Promise
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 