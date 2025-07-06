/**
 * Component Card - Khung chứa nội dung với style chuẩn
 * Sử dụng để tạo các khung chứa nội dung có style nhất quán
 */

import React from 'react';

/**
 * Card component
 * @param {React.ReactNode} children - Nội dung bên trong card
 * @param {string} title - Tiêu đề của card (tùy chọn)
 * @param {string} subtitle - Phụ đề của card (tùy chọn)
 * @param {string} className - CSS classes bổ sung
 * @param {string} padding - Padding của card (mặc định: p-6)
 * @param {string} shadow - Shadow của card (mặc định: shadow-md)
 * @param {Object} props - Các props khác được truyền vào div
 * @returns {JSX.Element} Card component với nội dung
 */
const Card = ({
  children, 
  title,
  subtitle,
  className = '',
  padding = 'p-6',
  shadow = 'shadow-md',
  ...props 
}) => {
  // CSS classes cơ bản cho card
  const baseClasses = 'bg-white rounded-lg border border-gray-200';
  // Kết hợp tất cả classes
  const classes = `${baseClasses} ${shadow} ${padding} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {/* Header với title và subtitle (chỉ hiển thị nếu có) */}
      {(title || subtitle) && (
        <div className="mb-4">
          {/* Tiêu đề chính */}
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {/* Phụ đề */}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {/* Nội dung chính của card */}
      {children}
    </div>
  );
};

export default Card; 