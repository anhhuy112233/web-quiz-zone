// Session Manager để hỗ trợ đăng nhập nhiều tài khoản
class SessionManager {
  constructor() {
    this.currentSession = null;
    this.sessions = this.loadSessions();
  }

  // Tạo session ID duy nhất
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Lấy tất cả sessions từ localStorage
  loadSessions() {
    try {
      const sessionsData = localStorage.getItem('quizzone_sessions');
      return sessionsData ? JSON.parse(sessionsData) : {};
    } catch (error) {
      console.error('Error loading sessions:', error);
      return {};
    }
  }

  // Lưu sessions vào localStorage
  saveSessions() {
    try {
      localStorage.setItem('quizzone_sessions', JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }

  // Tạo session mới
  createSession(user, token) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      user: user,
      token: token,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    this.sessions[sessionId] = session;
    this.currentSession = sessionId;
    this.saveSessions();
    
    // Lưu session hiện tại vào sessionStorage (chỉ cho tab hiện tại)
    sessionStorage.setItem('quizzone_current_session', sessionId);
    
    return sessionId;
  }

  // Lấy session hiện tại
  getCurrentSession() {
    if (!this.currentSession) {
      const sessionId = sessionStorage.getItem('quizzone_current_session');
      if (sessionId && this.sessions[sessionId]) {
        this.currentSession = sessionId;
      }
    }
    return this.currentSession ? this.sessions[this.currentSession] : null;
  }

  // Lấy user hiện tại
  getCurrentUser() {
    const session = this.getCurrentSession();
    return session ? session.user : null;
  }

  // Lấy token hiện tại
  getCurrentToken() {
    const session = this.getCurrentSession();
    return session ? session.token : null;
  }

  // Cập nhật session hiện tại
  updateCurrentSession(user, token) {
    if (this.currentSession && this.sessions[this.currentSession]) {
      this.sessions[this.currentSession].user = user;
      this.sessions[this.currentSession].token = token;
      this.sessions[this.currentSession].lastActive = new Date().toISOString();
      this.saveSessions();
    }
  }

  // Chuyển đổi session
  switchSession(sessionId) {
    if (this.sessions[sessionId]) {
      this.currentSession = sessionId;
      sessionStorage.setItem('quizzone_current_session', sessionId);
      this.sessions[sessionId].lastActive = new Date().toISOString();
      this.saveSessions();
      return true;
    }
    return false;
  }

  // Xóa session
  removeSession(sessionId) {
    if (this.sessions[sessionId]) {
      delete this.sessions[sessionId];
      if (this.currentSession === sessionId) {
        this.currentSession = null;
        sessionStorage.removeItem('quizzone_current_session');
      }
      this.saveSessions();
      return true;
    }
    return false;
  }

  // Xóa session hiện tại (logout)
  logout() {
    if (this.currentSession) {
      this.removeSession(this.currentSession);
    }
  }

  // Lấy tất cả sessions
  getAllSessions() {
    return Object.values(this.sessions);
  }

  // Lấy sessions theo role
  getSessionsByRole(role) {
    return Object.values(this.sessions).filter(session => session.user.role === role);
  }

  // Kiểm tra xem có session nào không
  hasAnySession() {
    return Object.keys(this.sessions).length > 0;
  }

  // Lấy số lượng sessions
  getSessionCount() {
    return Object.keys(this.sessions).length;
  }

  // Dọn dẹp sessions cũ (có thể gọi định kỳ)
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

// Tạo instance global
const sessionManager = new SessionManager();

export default sessionManager;

// Clear all sessions (for debugging)
export const clearAllSessions = () => {
  localStorage.removeItem('quizzone_sessions');
  localStorage.removeItem('quizzone_current_session');
  console.log('All sessions cleared');
};

// Get current session info for debugging
export const getCurrentSessionInfo = () => {
  const currentSession = getCurrentSession();
  const allSessions = getAllSessions();
  return {
    currentSession,
    allSessions,
    currentToken: getCurrentToken()
  };
}; 