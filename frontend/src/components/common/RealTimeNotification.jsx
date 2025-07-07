/**
 * Component RealTimeNotification - Thông báo real-time
 * Hiển thị các thông báo từ Socket.IO với animation và auto-dismiss
 */

import React, { useState, useEffect } from "react";
import socketClient from "../../utils/socket";

/**
 * RealTimeNotification component
 * Lắng nghe và hiển thị các thông báo real-time từ server
 * @returns {JSX.Element|null} Component thông báo hoặc null nếu không có thông báo
 */
const RealTimeNotification = () => {
  // State quản lý danh sách thông báo và trạng thái hiển thị
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Effect để thiết lập Socket.IO listeners
  useEffect(() => {
    // Kết nối Socket.IO
    const socket = socketClient.connect();

    if (!socket) return;

    // ==================== SOCKET EVENT LISTENERS ====================

    // Lắng nghe thông báo chung từ server
    socketClient.on("notification", (data) => {
      addNotification(data.message, data.type);
    });

    // Lắng nghe thông báo trạng thái user (đã comment)
    // socketClient.on('userStatus', (data) => {
    //   addNotification(`User ${data.userId} is now ${data.status}`, 'info');
    // });

    // Lắng nghe thông báo tham gia phòng thi
    socketClient.on("userJoinedExam", (data) => {
      if (data.userRole === "student") {
        addNotification(
          `Học sinh ${data.userName} đã tham gia bài thi`,
          "success"
        );
      }
    });

    // Lắng nghe thông báo rời phòng thi
    socketClient.on("userLeftExam", (data) => {
      if (data.userRole === "student") {
        addNotification(`Học sinh ${data.userName} đã rời bài thi`, "warning");
      }
    });

    // Lắng nghe thông báo hoàn thành bài thi
    socketClient.on("examCompleted", (data) => {
      addNotification(
        `Học sinh ${data.studentName} đã hoàn thành bài thi với ${data.score}/${data.totalQuestions} điểm`,
        "success"
      );
    });

    // Lắng nghe thông báo hoạt động đáng ngờ
    socketClient.on("suspiciousActivity", (data) => {
      addNotification(
        `Hoạt động đáng ngờ từ ${data.studentName}: ${data.activity}`,
        "error"
      );
    });

    // ==================== CLEANUP ====================
    
    // Cleanup event listeners khi component unmount
    return () => {
      socketClient.off("notification");
      // socketClient.off('userStatus');
      socketClient.off("userJoinedExam");
      socketClient.off("userLeftExam");
      socketClient.off("examCompleted");
      socketClient.off("suspiciousActivity");
    };
  }, []);

  /**
   * Thêm thông báo mới vào danh sách
   * @param {string} message - Nội dung thông báo
   * @param {string} type - Loại thông báo (success, warning, error, info)
   */
  const addNotification = (message, type = "info") => {
    // Tạo object thông báo với unique ID
    const activity = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Tạo unique ID
      message,
      type,
      timestamp: new Date(),
    };
    
    // Thêm thông báo mới vào đầu danh sách, giữ tối đa 5 thông báo
    setNotifications((prev) => [activity, ...prev.slice(0, 3)]);
    setIsVisible(true);

    // Tự động ẩn thông báo sau 5 giây
    setTimeout(() => {
      removeNotification(activity.id);
    }, 5000);
  };

  /**
   * Xóa thông báo theo ID
   * @param {string} id - ID của thông báo cần xóa
   */
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    // Ẩn component nếu không còn thông báo nào
    if (notifications.length <= 1) {
      setIsVisible(false);
    }
  };

  /**
   * Lấy icon tương ứng với loại thông báo
   * @param {string} type - Loại thông báo
   * @returns {string} Emoji icon
   */
  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return "✅";  // Checkmark cho thành công
      case "warning":
        return "⚠️";  // Cảnh báo
      case "error":
        return "❌";  // Lỗi
      default:
        return "ℹ️";  // Thông tin
    }
  };

  /**
   * Lấy CSS classes màu sắc tương ứng với loại thông báo
   * @param {string} type - Loại thông báo
   * @returns {string} CSS classes
   */
  const getNotificationColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";  // Xanh lá
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"; // Vàng
      case "error":
        return "bg-red-50 border-red-200 text-red-800";         // Đỏ
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";      // Xanh dương
    }
  };

  // Không hiển thị nếu không có thông báo hoặc component bị ẩn
  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Render từng thông báo */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border-l-4 shadow-lg transform transition-all duration-300 ease-in-out ${getNotificationColor(
            notification.type
          )}`}
        >
          <div className="flex items-start space-x-3">
            {/* Icon thông báo */}
            <span className="text-lg flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </span>
            
            {/* Nội dung thông báo */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{notification.message}</p>
              <p className="text-xs opacity-75 mt-1">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
            
            {/* Nút đóng thông báo */}
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RealTimeNotification;
