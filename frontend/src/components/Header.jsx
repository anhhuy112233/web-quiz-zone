// Import các thư viện React và React Router
import React, { useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * Xử lý sự kiện đăng xuất
   * Gọi hàm onLogout và chuyển hướng về trang chủ
   */
  const handleLogout = () => {
    onLogout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  /**
   * Toggle mobile menu
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  /**
   * Đóng mobile menu
   */
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo và tên ứng dụng */}
          <Link
            to="/"
            className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
            onClick={closeMobileMenu}
          >
            QuizZone
          </Link>

          {/* Hamburger menu button - chỉ hiện trên mobile */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Menu điều hướng - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
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

        {/* Mobile Menu - Dropdown */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={closeMobileMenu}
            ></div>
            
            {/* Mobile Menu Panel */}
            <nav className="absolute top-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
              <div className="px-4 py-4 space-y-3">
                {user ? (
                  <>
                    {/* Menu chung cho tất cả user đã đăng nhập */}
                    <Link
                      to="/dashboard"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Trang chủ
                    </Link>
                    
                    {/* Menu riêng cho Student */}
                    {user.role === "student" && (
                      <>
                        <Link
                          to="/student/exams"
                          className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={closeMobileMenu}
                        >
                          Danh sách thi
                        </Link>
                        <Link
                          to="/student/results"
                          className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={closeMobileMenu}
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
                          className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={closeMobileMenu}
                        >
                          Quản lý đề thi
                        </Link>
                        <Link
                          to="/teacher/results"
                          className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={closeMobileMenu}
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
                          className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={closeMobileMenu}
                        >
                          Quản lý người dùng
                        </Link>
                        <Link
                          to="/admin/classes"
                          className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={closeMobileMenu}
                        >
                          Quản lý lớp học
                        </Link>
                        <Link
                          to="/admin/reports"
                          className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={closeMobileMenu}
                        >
                          Báo cáo
                        </Link>
                        <Link
                          to="/admin/settings"
                          className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={closeMobileMenu}
                        >
                          Cài đặt
                        </Link>
                      </>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-3"></div>

                    {/* Thông tin user */}
                    <div className="py-2">
                      <Link
                        to={`/${user.role}/profile`}
                        className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                        onClick={closeMobileMenu}
                      >
                        👤 Thông tin cá nhân
                      </Link>
                      <span className="block py-2 text-gray-700">{user.name}</span>
                    </div>

                    {/* Nút đăng xuất */}
                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors text-left"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    {/* Menu cho user chưa đăng nhập */}
                    <Link
                      to="/login"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      className="block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors text-center"
                      onClick={closeMobileMenu}
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
