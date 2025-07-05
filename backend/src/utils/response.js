import { API_STATUS, HTTP_STATUS } from '../constants/index.js';

/**
 * Tạo response thành công
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Message
 * @param {Object} data - Data to send
 */
export const successResponse = (res, statusCode = HTTP_STATUS.OK, message = '', data = null) => {
  const response = {
    status: API_STATUS.SUCCESS
  };

  if (message) response.message = message;
  if (data) response.data = data;

  return res.status(statusCode).json(response);
};

/**
 * Tạo response lỗi
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} error - Error details
 */
export const errorResponse = (res, statusCode = HTTP_STATUS.BAD_REQUEST, message = '', error = null) => {
  const response = {
    status: API_STATUS.ERROR,
    message: message || 'Có lỗi xảy ra'
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

/**
 * Tạo response validation error
 * @param {Object} res - Express response object
 * @param {string} message - Validation message
 */
export const validationError = (res, message) => {
  return errorResponse(res, HTTP_STATUS.BAD_REQUEST, message);
};

/**
 * Tạo response not found
 * @param {Object} res - Express response object
 * @param {string} message - Not found message
 */
export const notFoundError = (res, message = 'Không tìm thấy dữ liệu') => {
  return errorResponse(res, HTTP_STATUS.NOT_FOUND, message);
};

/**
 * Tạo response unauthorized
 * @param {Object} res - Express response object
 * @param {string} message - Unauthorized message
 */
export const unauthorizedError = (res, message = 'Bạn chưa đăng nhập') => {
  return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, message);
};

/**
 * Tạo response forbidden
 * @param {Object} res - Express response object
 * @param {string} message - Forbidden message
 */
export const forbiddenError = (res, message = 'Bạn không có quyền thực hiện hành động này') => {
  return errorResponse(res, HTTP_STATUS.FORBIDDEN, message);
}; 