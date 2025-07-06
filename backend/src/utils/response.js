// Import các constants cần thiết
import { API_STATUS, HTTP_STATUS } from '../constants/index.js';  // Status codes và API status

/**
 * Utility function tạo response thành công
 * Chuẩn hóa format response cho tất cả API thành công
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (mặc định 200)
 * @param {string} message - Message thông báo (tùy chọn)
 * @param {Object} data - Dữ liệu trả về (tùy chọn)
 * @returns {Object} Response object với format chuẩn
 */
export const successResponse = (res, statusCode = HTTP_STATUS.OK, message = '', data = null) => {
  // Tạo object response cơ bản với status SUCCESS
  const response = {
    status: API_STATUS.SUCCESS
  };

  // Thêm message nếu có
  if (message) response.message = message;
  // Thêm data nếu có
  if (data) response.data = data;

  // Trả về response với status code tương ứng
  return res.status(statusCode).json(response);
};

/**
 * Utility function tạo response lỗi
 * Chuẩn hóa format response cho tất cả API lỗi
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (mặc định 400)
 * @param {string} message - Message lỗi (mặc định 'Có lỗi xảy ra')
 * @param {Object} error - Chi tiết lỗi (chỉ hiển thị trong development)
 * @returns {Object} Response object với format chuẩn
 */
export const errorResponse = (res, statusCode = HTTP_STATUS.BAD_REQUEST, message = '', error = null) => {
  // Tạo object response cơ bản với status ERROR
  const response = {
    status: API_STATUS.ERROR,
    message: message || 'Có lỗi xảy ra'
  };

  // Chỉ thêm chi tiết lỗi trong môi trường development
  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  // Trả về response với status code tương ứng
  return res.status(statusCode).json(response);
};

/**
 * Utility function tạo response lỗi validation
 * Wrapper cho errorResponse với status code 400 (Bad Request)
 * @param {Object} res - Express response object
 * @param {string} message - Message lỗi validation
 * @returns {Object} Response object với status 400
 */
export const validationError = (res, message) => {
  return errorResponse(res, HTTP_STATUS.BAD_REQUEST, message);
};

/**
 * Utility function tạo response lỗi không tìm thấy
 * Wrapper cho errorResponse với status code 404 (Not Found)
 * @param {Object} res - Express response object
 * @param {string} message - Message lỗi (mặc định 'Không tìm thấy dữ liệu')
 * @returns {Object} Response object với status 404
 */
export const notFoundError = (res, message = 'Không tìm thấy dữ liệu') => {
  return errorResponse(res, HTTP_STATUS.NOT_FOUND, message);
};

/**
 * Utility function tạo response lỗi chưa đăng nhập
 * Wrapper cho errorResponse với status code 401 (Unauthorized)
 * @param {Object} res - Express response object
 * @param {string} message - Message lỗi (mặc định 'Bạn chưa đăng nhập')
 * @returns {Object} Response object với status 401
 */
export const unauthorizedError = (res, message = 'Bạn chưa đăng nhập') => {
  return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, message);
};

/**
 * Utility function tạo response lỗi không có quyền
 * Wrapper cho errorResponse với status code 403 (Forbidden)
 * @param {Object} res - Express response object
 * @param {string} message - Message lỗi (mặc định 'Bạn không có quyền thực hiện hành động này')
 * @returns {Object} Response object với status 403
 */
export const forbiddenError = (res, message = 'Bạn không có quyền thực hiện hành động này') => {
  return errorResponse(res, HTTP_STATUS.FORBIDDEN, message);
}; 