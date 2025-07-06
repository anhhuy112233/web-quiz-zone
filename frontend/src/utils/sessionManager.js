/**
 * Session Manager để hỗ trợ đăng nhập nhiều tài khoản
 * Quản lý nhiều session cùng lúc, cho phép chuyển đổi giữa các tài khoản
 */
class SessionManager {
  constructor() {
    this.currentSession = null;  // ID của session hiện tại
    this.sessions = this.loadSessions();  // Load tất cả sessions từ localStorage
    this.tabId = this.getTabId();  // Unique ID cho tab hiện tại
  }

  /**
   * Tạo unique ID cho tab hiện tại
   * @returns {String} Tab ID
   */
  getTabId() {
    let tabId = sessionStorage.getItem('quizzone_tab_id');
    if (!tabId) {
      tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('quizzone_tab_id', tabId);
    }
    return tabId;
  }

  /**
   * Tạo session ID duy nhất
   * @returns {String} Session ID với timestamp và random string
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Lấy tất cả sessions từ localStorage
   * @returns {Object} Object chứa tất cả sessions
   */
  loadSessions() {
    try {
      const sessionsData = localStorage.getItem('quizzone_sessions');
      return sessionsData ? JSON.parse(sessionsData) : {};
    } catch (error) {
      console.error('Error loading sessions:', error);
      return {};
    }
  }

  /**
   * Lưu sessions vào localStorage
   */
  saveSessions() {
    try {
      localStorage.setItem('quizzone_sessions', JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }

  /**
   * Tạo session mới
   * @param {Object} user - Thông tin user
   * @param {String} token - JWT token
   * @returns {String} Session ID mới
   */
  createSession(user, token) {
    // Xóa examState cũ khi tạo session mới để tránh xung đột
    localStorage.removeItem('examState');
    
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      user: user,
      token: token,
      createdAt: new Date().toISOString(),      // Thời gian tạo session
      lastActive: new Date().toISOString()      // Thời gian hoạt động cuối
    };

    this.sessions[sessionId] = session;
    this.currentSession = sessionId;
    this.saveSessions();
    
    // Lưu session hiện tại vào localStorage với tab-specific key
    localStorage.setItem(`quizzone_current_session_${this.tabId}`, sessionId);
    
    return sessionId;
  }

  /**
   * Lấy session hiện tại
   * @returns {Object|null} Session object hoặc null
   */
  getCurrentSession() {
    if (!this.currentSession) {
      // Sử dụng tab-specific key để tránh xung đột giữa các tab
      const sessionId = localStorage.getItem(`quizzone_current_session_${this.tabId}`);
      if (sessionId && this.sessions[sessionId]) {
        this.currentSession = sessionId;
      }
    }
    return this.currentSession ? this.sessions[this.currentSession] : null;
  }

  /**
   * Lấy user hiện tại
   * @returns {Object|null} User object hoặc null
   */
  getCurrentUser() {
    const session = this.getCurrentSession();
    return session ? session.user : null;
  }

  /**
   * Lấy token hiện tại
   * @returns {String|null} JWT token hoặc null
   */
  getCurrentToken() {
    const session = this.getCurrentSession();
    return session ? session.token : null;
  }

  /**
   * Cập nhật session hiện tại
   * @param {Object} user - Thông tin user mới
   * @param {String} token - Token mới
   */
  updateCurrentSession(user, token) {
    if (this.currentSession && this.sessions[this.currentSession]) {
      this.sessions[this.currentSession].user = user;
      this.sessions[this.currentSession].token = token;
      this.sessions[this.currentSession].lastActive = new Date().toISOString();
      this.saveSessions();
    }
  }

  /**
   * Chuyển đổi session
   * @param {String} sessionId - ID của session muốn chuyển đến
   * @returns {Boolean} true nếu chuyển thành công, false nếu thất bại
   */
  switchSession(sessionId) {
    if (this.sessions[sessionId]) {
      // Xóa examState cũ khi chuyển session để tránh xung đột
      localStorage.removeItem('examState');
      
      this.currentSession = sessionId;
      localStorage.setItem(`quizzone_current_session_${this.tabId}`, sessionId);
      this.sessions[sessionId].lastActive = new Date().toISOString();
      this.saveSessions();
      return true;
    }
    return false;
  }

  /**
   * Xóa session
   * @param {String} sessionId - ID của session cần xóa
   * @returns {Boolean} true nếu xóa thành công, false nếu thất bại
   */
  removeSession(sessionId) {
    if (this.sessions[sessionId]) {
      delete this.sessions[sessionId];
      if (this.currentSession === sessionId) {
        this.currentSession = null;
        localStorage.removeItem(`quizzone_current_session_${this.tabId}`);
      }
      this.saveSessions();
      return true;
    }
    return false;
  }

  /**
   * Xóa session hiện tại (logout)
   */
  logout() {
    // Xóa examState khi logout để tránh xung đột
    localStorage.removeItem('examState');
    
    if (this.currentSession) {
      this.removeSession(this.currentSession);
    }
  }

  /**
   * Cleanup khi tab đóng
   */
  cleanupOnTabClose() {
    // Xóa tab-specific session khi tab đóng
    localStorage.removeItem(`quizzone_current_session_${this.tabId}`);
    sessionStorage.removeItem('quizzone_tab_id');
  }

  /**
   * Lấy tất cả sessions
   * @returns {Array} Array chứa tất cả session objects
   */
  getAllSessions() {
    return Object.values(this.sessions);
  }

  /**
   * Lấy sessions theo role
   * @param {String} role - Role cần lọc (student, teacher, admin)
   * @returns {Array} Array chứa sessions có role tương ứng
   */
  getSessionsByRole(role) {
    return Object.values(this.sessions).filter(session => session.user.role === role);
  }

  /**
   * Kiểm tra xem có session nào không
   * @returns {Boolean} true nếu có ít nhất 1 session, false nếu không có
   */
  hasAnySession() {
    return Object.keys(this.sessions).length > 0;
  }

  /**
   * Lấy số lượng sessions
   * @returns {Number} Số lượng sessions hiện có
   */
  getSessionCount() {
    return Object.keys(this.sessions).length;
  }

  /**
   * Dọn dẹp sessions cũ (có thể gọi định kỳ)
   * @param {Number} maxAge - Thời gian tối đa của session (milliseconds)
   */
  cleanupOldSessions(maxAge = 24 * 60 * 60 * 1000) { // 24 giờ
    const now = new Date();
    const sessionIds = Object.keys(this.sessions);
    
    sessionIds.forEach(sessionId => {
      const session = this.sessions[sessionId];
      const sessionAge = now - new Date(session.createdAt);
      
      if (sessionAge > maxAge) {
        this.removeSession(sessionId);
      }
    });
  }
}

// Tạo instance global để sử dụng trong toàn bộ ứng dụng
const sessionManager = new SessionManager();

export default sessionManager;

/**
 * Clear all sessions (for debugging)
 * Xóa tất cả sessions khỏi localStorage
 */
export const clearAllSessions = () => {
  localStorage.removeItem('quizzone_sessions');
  localStorage.removeItem('quizzone_current_session');
  console.log('All sessions cleared');
};

/**
 * Get current session info for debugging
 * Lấy thông tin session hiện tại để debug
 * @returns {Object} Thông tin session hiện tại và tất cả sessions
 */
export const getCurrentSessionInfo = () => {
  const currentSession = sessionManager.getCurrentSession();
  const allSessions = sessionManager.getAllSessions();
  return {
    currentSession,
    allSessions,
    currentToken: sessionManager.getCurrentToken()
  };
}; 