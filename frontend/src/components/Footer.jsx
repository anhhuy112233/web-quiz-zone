import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">QuizZone</h3>
            <p className="text-gray-300">
              Nền tảng thi trắc nghiệm trực tuyến hiện đại, an toàn và dễ sử dụng.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-300 hover:text-white transition-colors">Về chúng tôi</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors">Liên hệ</a></li>
              <li><a href="/help" className="text-gray-300 hover:text-white transition-colors">Hỗ trợ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>
            <div className="space-y-2 text-gray-300">
              <p>Email: support@exam-system.com</p>
              <p>Điện thoại: (84) 123-456-789</p>
              <p>Địa chỉ: Hà Nội, Việt Nam</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 QuizZone. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 