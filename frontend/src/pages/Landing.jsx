/**
 * Component Landing - Trang chủ landing page
 * Trang giới thiệu sản phẩm QuizZone với các tính năng và thông tin marketing
 */

import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";

/**
 * Landing component
 * Trang landing page chính của ứng dụng với các section marketing
 * @returns {JSX.Element} Landing page với hero, features, và CTA sections
 */
const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* ==================== HEADER ==================== */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="text-2xl font-bold text-blue-600">
              <Link to="/">QuizZone</Link>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link to="/register">
                <Button variant="primary">Đăng ký miễn phí</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== HERO SECTION ==================== */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            {/* Main headline */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Nền tảng
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}
                Thi Trắc Nghiệm{" "}
              </span>
              Hiện Đại
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              QuizZone - Giải pháp toàn diện cho việc tạo, quản lý và tham gia
              các bài thi trắc nghiệm trực tuyến. Dành cho giáo viên, học sinh
              và tổ chức giáo dục.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register">
                <Button
                  variant="primary"
                  size="lg"
                  className="text-lg px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 font-semibold text-white"
                >
                  <span className="mr-2">🚀</span>
                  Bắt đầu miễn phí
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-10 py-4 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg font-semibold text-gray-700 hover:text-blue-700"
                >
                  <span className="mr-2">🔐</span>
                  Đăng nhập ngay
                </Button>
              </Link>
            </div>
          </div>

          {/* ==================== STATISTICS CARDS ==================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {/* Bài thi đã tạo */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                10,000+
              </div>
              <div className="text-gray-600">Bài thi đã tạo</div>
            </div>

            {/* Học sinh tham gia */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                50,000+
              </div>
              <div className="text-gray-600">Học sinh tham gia</div>
            </div>

            {/* Uptime hệ thống */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                99.9%
              </div>
              <div className="text-gray-600">Uptime hệ thống</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Khám phá những tính năng mạnh mẽ giúp việc thi trắc nghiệm trở nên
              dễ dàng và hiệu quả
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Tạo đề thi dễ dàng */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Tạo đề thi dễ dàng
              </h3>
              <p className="text-gray-600">
                Giao diện trực quan giúp giáo viên tạo đề thi nhanh chóng với
                nhiều loại câu hỏi đa dạng.
              </p>
            </div>

            {/* Feature 2: Giám sát thời gian thực */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Giám sát thời gian thực
              </h3>
              <p className="text-gray-600">
                Theo dõi tiến độ làm bài của học sinh và can thiệp kịp thời khi
                cần thiết.
              </p>
            </div>

            {/* Feature 3: Báo cáo chi tiết */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Báo cáo chi tiết
              </h3>
              <p className="text-gray-600">
                Phân tích kết quả thi với biểu đồ và thống kê chi tiết giúp đánh
                giá hiệu quả.
              </p>
            </div>

            {/* Feature 4: Bảo mật cao */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Bảo mật cao
              </h3>
              <p className="text-gray-600">
                Hệ thống bảo mật đa lớp, mã hóa dữ liệu và kiểm soát truy cập
                nghiêm ngặt.
              </p>
            </div>

            {/* Feature 5: Responsive design */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-8">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Responsive design
              </h3>
              <p className="text-gray-600">
                Tương thích mọi thiết bị từ desktop đến mobile, học sinh có thể
                thi mọi lúc mọi nơi.
              </p>
            </div>

            {/* Feature 6: Hiệu suất cao */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-8">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Hiệu suất cao
              </h3>
              <p className="text-gray-600">
                Tối ưu hóa tốc độ tải trang và xử lý dữ liệu, hỗ trợ hàng nghìn
                người dùng đồng thời.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS SECTION ==================== */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cách hoạt động
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chỉ với 3 bước đơn giản, bạn đã có thể bắt đầu sử dụng QuizZone
            </p>
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: Đăng ký tài khoản */}
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Đăng ký tài khoản
              </h3>
              <p className="text-gray-600">
                Tạo tài khoản miễn phí với vai trò giáo viên hoặc học sinh trong
                vài giây.
              </p>
            </div>

            {/* Step 2: Tạo hoặc tham gia thi */}
            <div className="text-center">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Tạo hoặc tham gia thi
              </h3>
              <p className="text-gray-600">
                Giáo viên tạo đề thi, học sinh tham gia thi với giao diện thân
                thiện.
              </p>
            </div>

            {/* Step 3: Xem kết quả */}
            <div className="text-center">
              <div className="bg-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Xem kết quả
              </h3>
              <p className="text-gray-600">
                Nhận kết quả ngay lập tức với phân tích chi tiết và báo cáo đầy
                đủ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Tham gia cùng hàng nghìn giáo viên và học sinh đang sử dụng QuizZone
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/register">
              <Button
                variant="primary"
                size="lg"
                className="text-lg px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 font-semibold text-white"
              >
                <span className="mr-2">🚀</span>
                Bắt đầu miễn phí
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-10 py-4 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg font-semibold text-gray-700 hover:text-blue-700"
              >
                <span className="mr-2">🔐</span>
                Đăng nhập ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Footer content grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company info */}
            <div>
              <h3 className="text-xl font-bold mb-4">QuizZone</h3>
              <p className="text-gray-400">
                Nền tảng thi trắc nghiệm trực tuyến hiện đại, an toàn và dễ sử
                dụng.
              </p>
            </div>

            {/* Product links */}
            <div>
              <h4 className="font-semibold mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tính năng
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Bảng giá
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            {/* Support links */}
            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Trung tâm trợ giúp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Liên hệ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tài liệu
                  </a>
                </li>
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h4 className="font-semibold mb-4">Công ty</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Về chúng tôi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tuyển dụng
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 QuizZone. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
