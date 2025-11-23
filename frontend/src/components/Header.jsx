// Import các thư viện React và React Router
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import SessionSwitcher from "./SessionSwitcher";

/**
 * Component Header - Thanh điều hướng chính của ứng dụng
 * Hiển thị logo, menu điều hướng và thông tin user
 * @param {Object} user - Thông tin user hiện tại
 * @param {Function} onLogout - Hàm xử lý đăng xuất
 * @param {Function} onSessionChange - Hàm xử lý chuyển đổi session
 */
const Header = ({ user, onLogout, onSessionChange }) => {
  const navigate = useNavigate();

  /**
   * Xử lý sự kiện đăng xuất
   * Gọi hàm onLogout và chuyển hướng về trang chủ
   */
  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo và tên ứng dụng */}
          <Link
            to="/"
            className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            QuizZone
          </Link>

          {/* Menu điều hướng */}
          <nav className="flex items-center space-x-6">
            {user ? (
              <>
                {/* Menu chung cho tất cả user đã đăng nhập */}
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Trang chủ
                </Link>
                
                {/* Menu riêng cho Student */}
                {user.role === "student" && (
                  <>
                    <Link
                      to="/student/exams"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Danh sách thi
                    </Link>
                    <Link
                      to="/student/results"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Kết quả
                    </Link>
                  </>
                )}
                
                {/* Menu riêng cho Teacher */}
                {user.role === "teacher" && (
                  <>
                    <Link
                      to="/teacher/exams"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Quản lý đề thi
                    </Link>
                    <Link
                      to="/teacher/results"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Xem kết quả
                    </Link>
                  </>
                )}
                
                {/* Menu riêng cho Admin */}
                {user.role === "admin" && (
                  <>
                    <Link
                      to="/admin/users"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Quản lý người dùng
                    </Link>

                    <Link
                      to="/admin/classes"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Quản lý lớp học
                    </Link>

                    <Link
                      to="/admin/reports"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Báo cáo
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Cài đặt
                    </Link>
                  </>
                )}

                {/* Component chuyển đổi session */}
                {/* <SessionSwitcher onSessionChange={onSessionChange} /> */}

                {/* Thông tin user và nút đăng xuất */}
                <div className="flex items-center space-x-4">
                  <Link
                    to={`/${user.role}/profile`}
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    👤 Thông tin cá nhân
                  </Link>
                  <span className="text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                {/* Menu cho user chưa đăng nhập */}
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
