/**
 * File utility cho API calls
 * Chứa các helper functions để tương tác với backend API
 */

// Import sessionManager để quản lý session và token
import sessionManager from './sessionManager';

// Base URL cho API (có thể lấy từ env variable)
// Đảm bảo luôn có /api ở cuối
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Nếu env URL đã có /api thì dùng, nếu không thì thêm
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseUrl();

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

/**
 * Utility để tạo full API URL
 * @param {String} endpoint - API endpoint (ví dụ: 'users', 'exams', 'classes')
 * @returns {String} Full URL
 */
export const getApiUrl = (endpoint) => {
  // Loại bỏ dấu / ở đầu nếu có
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  // API_BASE_URL đã được đảm bảo có /api ở cuối từ getBaseUrl()
  // Chỉ cần nối endpoint
  const url = `${API_BASE_URL}/${cleanEndpoint}`;
  console.log('getApiUrl:', { endpoint, cleanEndpoint, API_BASE_URL, url }); // Debug log
  return url;
};

/**
 * Utility để gọi API với error handling
 * @param {String} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} Response data
 */
export const apiCall = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra');
  }

  return data;
}; 