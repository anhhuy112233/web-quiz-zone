import sessionManager from './sessionManager';

// Utility để lấy headers với token cho API calls
export const getAuthHeaders = () => {
  const token = sessionManager.getCurrentToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Utility để kiểm tra xem có token không
export const hasValidToken = () => {
  return !!sessionManager.getCurrentToken();
};

// Utility để lấy user hiện tại
export const getCurrentUser = () => {
  return sessionManager.getCurrentUser();
}; 