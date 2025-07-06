/**
 * Component SessionSwitcher - Quản lý và chuyển đổi giữa các session
 * Cho phép user đăng nhập nhiều tài khoản cùng lúc và chuyển đổi giữa chúng
 */

import React, { useState, useEffect } from 'react';
import sessionManager from '../utils/sessionManager';
import Button from './common/Button';

/**
 * SessionSwitcher component
 * @param {Function} onSessionChange - Callback khi session thay đổi
 * @returns {JSX.Element|null} Component quản lý sessions hoặc null nếu không có session
 */
const SessionSwitcher = ({ onSessionChange }) => {
  // State quản lý danh sách sessions và session hiện tại
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Effect để khởi tạo và cleanup sessions
  useEffect(() => {
    // Cập nhật danh sách sessions khi component mount
    updateSessions();
    
    // Cleanup old sessions mỗi giờ
    const cleanupInterval = setInterval(() => {
      sessionManager.cleanupOldSessions();
      updateSessions();
    }, 60 * 60 * 1000); // 1 giờ

    // Cleanup interval khi component unmount
    return () => clearInterval(cleanupInterval);
  }, []);

  /**
   * Cập nhật danh sách sessions và session hiện tại
   */
  const updateSessions = () => {
    const allSessions = sessionManager.getAllSessions();
    const current = sessionManager.getCurrentSession();
    setSessions(allSessions);
    setCurrentSession(current);
  };

  /**
   * Xử lý chuyển đổi session
   * @param {string} sessionId - ID của session cần chuyển đến
   */
  const handleSwitchSession = (sessionId) => {
    if (sessionManager.switchSession(sessionId)) {
      updateSessions();
      // Gọi callback nếu có
      if (onSessionChange) {
        onSessionChange(sessionManager.getCurrentUser());
      }
      setIsOpen(false);
    }
  };

  /**
   * Xử lý đăng xuất session
   * @param {string} sessionId - ID của session cần đăng xuất
   */
  const handleLogoutSession = (sessionId) => {
    if (sessionManager.removeSession(sessionId)) {
      updateSessions();
      // Gọi callback nếu có
      if (onSessionChange) {
        onSessionChange(sessionManager.getCurrentUser());
      }
    }
  };

  /**
   * Lấy icon tương ứng với role
   * @param {string} role - Role của user
   * @returns {string} Emoji icon
   */
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👑';      // Vương miện cho admin
      case 'teacher': return '👨‍🏫';   // Giáo viên
      case 'student': return '👨‍🎓';   // Học sinh
      default: return '👤';           // User mặc định
    }
  };

  /**
   * Lấy màu text tương ứng với role
   * @param {string} role - Role của user
   * @returns {string} CSS class màu
   */
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-purple-600';    // Tím cho admin
      case 'teacher': return 'text-blue-600';    // Xanh dương cho teacher
      case 'student': return 'text-green-600';   // Xanh lá cho student
      default: return 'text-gray-600';           // Xám cho default
    }
  };

  // Không hiển thị nếu không có session nào
  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Nút Session Switcher */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm"
      >
        <span>🔄</span>
        <span>Sessions ({sessions.length})</span>
        {/* Hiển thị session hiện tại */}
        {currentSession && (
          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getRoleColor(currentSession.user.role)}`}>
            {getRoleIcon(currentSession.user.role)} {currentSession.user.name}
          </span>
        )}
      </Button>

      {/* Dropdown danh sách sessions */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Quản lý Sessions
            </h3>
            
            {/* Danh sách sessions với scroll */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg border transition-all ${
                    currentSession && currentSession.id === session.id
                      ? 'border-blue-500 bg-blue-50'  // Highlight session hiện tại
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Thông tin session */}
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getRoleIcon(session.user.role)}</span>
                      <div>
                        <div className={`font-medium ${getRoleColor(session.user.role)}`}>
                          {session.user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {session.user.email} • {session.user.role}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(session.lastActive).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Các nút thao tác */}
                    <div className="flex items-center space-x-1">
                      {currentSession && currentSession.id === session.id ? (
                        <span className="text-xs text-blue-600 font-medium">Đang hoạt động</span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSwitchSession(session.id)}
                          className="text-xs"
                        >
                          Chuyển
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleLogoutSession(session.id)}
                        className="text-xs"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer với thống kê và nút đăng xuất tất cả */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Tổng cộng: {sessions.length} sessions</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Đăng xuất tất cả sessions
                    sessions.forEach(session => sessionManager.removeSession(session.id));
                    updateSessions();
                    if (onSessionChange) {
                      onSessionChange(null);
                    }
                  }}
                  className="text-xs"
                >
                  Đăng xuất tất cả
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop để đóng dropdown khi click bên ngoài */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SessionSwitcher; 