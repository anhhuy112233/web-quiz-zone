import React, { useState, useEffect } from 'react';
import sessionManager from '../utils/sessionManager';
import Button from './common/Button';

const SessionSwitcher = ({ onSessionChange }) => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    updateSessions();
    // Cleanup old sessions every hour
    const cleanupInterval = setInterval(() => {
      sessionManager.cleanupOldSessions();
      updateSessions();
    }, 60 * 60 * 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  const updateSessions = () => {
    const allSessions = sessionManager.getAllSessions();
    const current = sessionManager.getCurrentSession();
    setSessions(allSessions);
    setCurrentSession(current);
  };

  const handleSwitchSession = (sessionId) => {
    if (sessionManager.switchSession(sessionId)) {
      updateSessions();
      if (onSessionChange) {
        onSessionChange(sessionManager.getCurrentUser());
      }
      setIsOpen(false);
    }
  };

  const handleLogoutSession = (sessionId) => {
    if (sessionManager.removeSession(sessionId)) {
      updateSessions();
      if (onSessionChange) {
        onSessionChange(sessionManager.getCurrentUser());
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👑';
      case 'teacher': return '👨‍🏫';
      case 'student': return '👨‍🎓';
      default: return '👤';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-purple-600';
      case 'teacher': return 'text-blue-600';
      case 'student': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Session Switcher Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm"
      >
        <span>🔄</span>
        <span>Sessions ({sessions.length})</span>
        {currentSession && (
          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getRoleColor(currentSession.user.role)}`}>
            {getRoleIcon(currentSession.user.role)} {currentSession.user.name}
          </span>
        )}
      </Button>

      {/* Session Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Quản lý Sessions
            </h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg border transition-all ${
                    currentSession && currentSession.id === session.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
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

            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Tổng cộng: {sessions.length} sessions</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
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

      {/* Backdrop */}
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