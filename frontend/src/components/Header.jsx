// Import các thư viện React và React Router
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SessionSwitcher from "./SessionSwitcher";

/**
 * Component Header - Thanh điều hướng chính của ứng dụng
 * Responsive: Có menu hamburger cho mobile, menu ngang cho desktop
 * Hiển thị logo, menu điều hướng và thông tin user
 * @param {Object} user - Thông tin user hiện tại
 * @param {Function} onLogout - Hàm xử lý đăng xuất
 * @param {Function} onSessionChange - Hàm xử lý chuyển đổi session
 */
const Header = ({ user, onLogout, onSessionChange }) => {
  const navigate = useNavigate();
  // State quản lý trạng thái mở/đóng menu trên mobile
  const [menuOpen, setMenuOpen] = useState(false);

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

          {/* Hamburger menu (chỉ hiện trên mobile) */}
          <button
            className="md:hidden flex items-center px-2 py-1 text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {/* Icon hamburger hoặc dấu X */}
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          {/* Menu điều hướng - ngang trên desktop, dọc trên mobile */}
          <nav
            className={`
              flex-col md:flex-row md:flex items-center space-y-4 md:space-y-0 md:space-x-6
              absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent z-50
              transition-all duration-200
              ${menuOpen ? "flex" : "hidden md:flex"}
            `}
          >
            {user ? (
              <>
                {/* Menu chung cho user đã đăng nhập */}
                <Link to="/dashboard" className="block py-2 md:py-0 text-gray-700 hover:text-blue-600 transition-colors">
                  Trang chủ
                </Link>
                {/* Menu riêng cho Student */}
                {user.role === "student" && (
                  <>
                    <Link to="/student/exams" className="block py-2 md:py-0 text-gray-700 hover:text-blue-600">Danh sách thi</Link>
                    <Link to="/student/results" className="block py-2 md:py-0 text-gray-700 hover:text-blue-600">Kết quả</Link>
                  </>
                )}
                {/* Menu riêng cho Teacher */}
                {user.role === "teacher" && (
                  <>
                    <Link to="/teacher/exams" className="block py-2 md:py-0 text-gray-700 hover:text-blue-600">Quản lý đề thi</Link>
                    <Link to="/teacher/results" className="block py-2 md:py-0 text-gray-700 hover:text-blue-600">Xem kết quả</Link>
                  </>
                )}
                {/* Menu riêng cho Admin */}
                {user.role === "admin" && (
                  <>
                    <Link to="/admin/users" className="block py-2 md:py-0 text-gray-700 hover:text-blue-600">Quản lý người dùng</Link>
                    <Link to="/admin/reports" className="block py-2 md:py-0 text-gray-700 hover:text-blue-600">Báo cáo</Link>
                    <Link to="/admin/settings" className="block py-2 md:py-0 text-gray-700 hover:text-blue-600">Cài đặt</Link>
                  </>
                )}
                {/* Thông tin user và nút đăng xuất */}
                <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 mt-2 md:mt-0">
                  <Link to={`/${user.role}/profile`} className="text-gray-700 hover:text-blue-600">👤 Thông tin cá nhân</Link>
                  <span className="text-gray-700">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors w-full md:w-auto"
                  >
                    Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Menu cho user chưa đăng nhập */}
                <Link to="/login" className="block py-2 md:py-0 text-gray-700 hover:text-blue-600">Đăng nhập</Link>
                <Link to="/register" className="block py-2 md:py-0 bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-md transition-colors w-full md:w-auto text-center">Đăng ký</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
