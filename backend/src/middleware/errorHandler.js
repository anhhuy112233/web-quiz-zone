import { errorResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user?.id
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'ID không hợp lệ';
    error = { message, statusCode: HTTP_STATUS.BAD_REQUEST };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} đã tồn tại`;
    error = { message, statusCode: HTTP_STATUS.BAD_REQUEST };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: HTTP_STATUS.BAD_REQUEST };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token không hợp lệ';
    error = { message, statusCode: HTTP_STATUS.UNAUTHORIZED };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token đã hết hạn';
    error = { message, statusCode: HTTP_STATUS.UNAUTHORIZED };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File quá lớn. Kích thước tối đa là 5MB';
    error = { message, statusCode: HTTP_STATUS.BAD_REQUEST };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'File không được hỗ trợ';
    error = { message, statusCode: HTTP_STATUS.BAD_REQUEST };
  }

  return errorResponse(
    res,
    error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    error.message || 'Có lỗi xảy ra trên server',
    process.env.NODE_ENV === 'development' ? err : null
  );
};

/**
 * 404 handler for undefined routes
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Không tìm thấy route: ${req.originalUrl}`);
  error.statusCode = HTTP_STATUS.NOT_FOUND;
  next(error);
};

/**
 * Async error wrapper
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 