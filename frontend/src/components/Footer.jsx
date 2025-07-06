/**
 * Component Footer - Chân trang của ứng dụng
 * Hiển thị thông tin liên hệ, liên kết nhanh và copyright
 */

import React from 'react';

/**
 * Footer component
 * @returns {JSX.Element} Footer với thông tin liên hệ và liên kết
 */
const Footer = () => {
  return (
    // Footer với background tối và text trắng, tự động đẩy xuống cuối trang
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      {/* Container chính với responsive padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid layout 3 cột trên desktop, 1 cột trên mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Cột 1: Thông tin về QuizZone */}
          <div>
            <h3 className="text-lg font-semibold mb-4">QuizZone</h3>
            <p className="text-gray-300">
              Nền tảng thi trắc nghiệm trực tuyến hiện đại, an toàn và dễ sử dụng.
            </p>
          </div>
          
          {/* Cột 2: Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="/help" className="text-gray-300 hover:text-white transition-colors">
                  Hỗ trợ
                </a>
              </li>
            </ul>
          </div>
          
          {/* Cột 3: Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>
            <div className="space-y-2 text-gray-300">
              <p>Email: support@exam-system.com</p>
              <p>Điện thoại: (84) 123-456-789</p>
              <p>Địa chỉ: Hà Nội, Việt Nam</p>
            </div>
          </div>
        </div>
        
        {/* Phần copyright ở cuối footer */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 QuizZone. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 