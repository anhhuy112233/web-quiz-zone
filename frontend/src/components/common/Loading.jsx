/**
 * Component Loading - Hiển thị trạng thái đang tải
 * Sử dụng để hiển thị spinner và text khi đang load dữ liệu
 */

import React from 'react';

/**
 * Loading component
 * @param {string} size - Kích thước spinner (sm, md, lg, xl)
 * @param {string} text - Text hiển thị bên dưới spinner
 * @param {string} className - CSS classes bổ sung
 * @param {boolean} fullScreen - Có hiển thị full screen không
 * @returns {JSX.Element} Loading component với spinner và text
 */
const Loading = ({ 
  size = 'md', 
  text = 'Đang tải...', 
  className = '',
  fullScreen = false 
}) => {
  // Mapping kích thước với CSS classes
  const sizeClasses = {
    sm: 'w-4 h-4',    // Nhỏ (16px)
    md: 'w-8 h-8',    // Trung bình (32px)
    lg: 'w-12 h-12',  // Lớn (48px)
    xl: 'w-16 h-16'   // Rất lớn (64px)
  };
  
  // Spinner với animation xoay
  const spinner = (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
  );
  
  // Hiển thị full screen nếu được yêu cầu
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          {spinner}
          {/* Text bên dưới spinner */}
          {text && (
            <p className="mt-4 text-gray-600">{text}</p>
          )}
        </div>
      </div>
    );
  }

  // Hiển thị inline loading
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        {spinner}
        {/* Text bên dưới spinner */}
        {text && (
          <p className="mt-2 text-sm text-gray-600">{text}</p>
        )}
      </div>
    </div>
  );
};

export default Loading; 