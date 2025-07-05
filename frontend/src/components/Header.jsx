import React from "react";
import { Link, useNavigate } from "react-router-dom";
import SessionSwitcher from "./SessionSwitcher";

const Header = ({ user, onLogout, onSessionChange }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            QuizZone
          </Link>

          <nav className="flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Trang chủ
                </Link>
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
                {user.role === "teacher" && (
                  <>
                    <Link
                      to="/teacher/exams"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Quản lý đề thi
                    </Link>
                    <Link
                      to="/teacher/teacher/results"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Xem kết quả
                    </Link>
                  </>
                )}
                {user.role === "admin" && (
                  <>
                    <Link
                      to="/users"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Quản lý người dùng
                    </Link>
                    <Link
                      to="/settings"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Cài đặt
                    </Link>
                  </>
                )}

                {/* Session Switcher */}
                <SessionSwitcher onSessionChange={onSessionChange} />

                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
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
