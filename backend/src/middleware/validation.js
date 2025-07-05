import { validationError } from '../utils/response.js';
import { VALIDATION_MESSAGES } from '../constants/index.js';

/**
 * Validate required fields
 * @param {string[]} fields - Array of required field names
 */
export const validateRequired = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      const message = `Các trường sau là bắt buộc: ${missingFields.join(', ')}`;
      return validationError(res, message);
    }
    
    next();
  };
};

/**
 * Validate email format
 */
export const validateEmail = (req, res, next) => {
  const email = req.body.email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (email && !emailRegex.test(email)) {
    return validationError(res, VALIDATION_MESSAGES.INVALID_EMAIL);
  }
  
  next();
};

/**
 * Validate password strength
 */
export const validatePassword = (req, res, next) => {
  const password = req.body.password;
  
  if (password && password.length < 6) {
    return validationError(res, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH);
  }
  
  next();
};

/**
 * Validate ObjectId format
 * @param {string} paramName - Parameter name to validate
 */
export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    
    if (id && !objectIdRegex.test(id)) {
      return validationError(res, 'ID không hợp lệ');
    }
    
    next();
  };
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    return validationError(res, 'Tham số phân trang không hợp lệ');
  }
  
  req.query.page = pageNum;
  req.query.limit = limitNum;
  
  next();
};

/**
 * Validate file upload
 */
export const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return validationError(res, 'Vui lòng chọn file để upload');
  }
  
  next();
}; 