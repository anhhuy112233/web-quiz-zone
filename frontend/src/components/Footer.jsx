/**
 * Component Footer - Chân trang của ứng dụng
 * Responsive: Hiển thị đẹp trên mọi thiết bị, căn giữa trên mobile, chia cột trên desktop
 */
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid layout: dọc trên mobile, ngang trên desktop */}
        <div className="flex flex-col md:flex-row md:justify-between gap-8 text-center md:text-left">
          {/* Cột 1: Thông tin về QuizZone */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">QuizZone</h3>
            <p className="text-gray-300 text-sm">
              Nền tảng thi trắc nghiệm trực tuyến hiện đại, an toàn và dễ sử dụng.
            </p>
          </div>
          {/* Cột 2: Liên kết nhanh */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="/help" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Hỗ trợ
                </a>
              </li>
            </ul>
          </div>
          {/* Cột 3: Thông tin liên hệ */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Thông tin liên hệ</h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>Email: support@exam-system.com</p>
              <p>Điện thoại: (84) 123-456-789</p>
              <p>Địa chỉ: Hà Nội, Việt Nam</p>
            </div>
          </div>
        </div>
        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300 text-sm">
          <p>&copy; 2024 QuizZone. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 