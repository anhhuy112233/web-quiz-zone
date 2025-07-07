/**
 * File utility cho API calls
 * Chứa các helper functions để tương tác với backend API
 */

// Import sessionManager để quản lý session và token
import sessionManager from './sessionManager';

// API Base URL - force production URL trong production
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://web-quiz-zone.onrender.com'  // Force production URL
  : (import.meta.env.VITE_API_URL || 'https://web-quiz-zone.onrender.com');

/**
 * Helper function để tạo API URL
 * @param {string} endpoint - API endpoint (ví dụ: '/api/auth/login')
 * @returns {string} Full API URL
 */
export const createApiUrl = (endpoint) => {
  // Đảm bảo endpoint bắt đầu bằng '/'
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Utility để lấy headers với token cho API calls
 * Tự động thêm Authorization header với JWT token từ session
 * @returns {Object} Headers object với Authorization và Content-Type
 */
export const getAuthHeaders = () => {
  // Lấy token hiện tại từ session manager
  const token = sessionManager.getCurrentToken();
  
  // Trả về headers chuẩn cho API calls
  return {
    'Authorization': `Bearer ${token}`,  // JWT token format: Bearer <token>
    'Content-Type': 'application/json'   // JSON content type
  };
};

/**
 * Utility để kiểm tra xem có token hợp lệ không
 * Sử dụng để kiểm tra trạng thái đăng nhập
 * @returns {Boolean} true nếu có token, false nếu không có
 */
export const hasValidToken = () => {
  // Kiểm tra xem có token trong session không
  return !!sessionManager.getCurrentToken();
};

/**
 * Utility để lấy thông tin user hiện tại
 * Lấy thông tin user từ session storage
 * @returns {Object|null} Thông tin user hoặc null nếu chưa đăng nhập
 */
export const getCurrentUser = () => {
  // Lấy thông tin user từ session manager
  return sessionManager.getCurrentUser();
}; 