import React, { useState, useEffect } from "react";
import socketClient from "../../utils/socket.js";

const RealTimeNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const socket = socketClient.connect();

    if (!socket) return;

    // Lắng nghe thông báo từ server
    socketClient.on("notification", (data) => {
      addNotification(data.message, data.type);
    });

    // Lắng nghe thông báo trạng thái user
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

    return () => {
      // Cleanup event listeners
      socketClient.off("notification");
      // socketClient.off('userStatus');
      socketClient.off("userJoinedExam");
      socketClient.off("userLeftExam");
      socketClient.off("examCompleted");
      socketClient.off("suspiciousActivity");
    };
  }, []);

  const addNotification = (message, type = "info") => {
    const activity = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Tạo unique ID
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications((prev) => [activity, ...prev.slice(0, 3)]); // Giữ tối đa 5 thông báo
    setIsVisible(true);

    // Tự động ẩn sau 5 giây
    setTimeout(() => {
      removeNotification(activity.id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    if (notifications.length <= 1) {
      setIsVisible(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border-l-4 shadow-lg transform transition-all duration-300 ease-in-out ${getNotificationColor(
            notification.type
          )}`}
        >
          <div className="flex items-start space-x-3">
            <span className="text-lg flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{notification.message}</p>
              <p className="text-xs opacity-75 mt-1">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
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
