// Import thư viện React
import React from 'react';

/**
 * Component Button - Nút bấm có thể tùy chỉnh
 * Hỗ trợ nhiều variant, size và trạng thái khác nhau
 * @param {React.ReactNode} children - Nội dung bên trong button
 * @param {Function} onClick - Hàm xử lý sự kiện click
 * @param {String} type - Loại button (button, submit, reset)
 * @param {String} variant - Kiểu dáng button (primary, secondary, success, danger, warning, outline, ghost)
 * @param {String} size - Kích thước button (sm, md, lg, xl)
 * @param {Boolean} disabled - Trạng thái vô hiệu hóa
 * @param {Boolean} loading - Trạng thái đang tải (hiển thị spinner)
 * @param {String} className - CSS classes bổ sung
 * @param {Object} props - Các props khác
 */
const Button = ({
  children,
  onClick, 
  type = 'button', 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  // CSS classes cơ bản cho tất cả button
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // CSS classes cho các variant khác nhau
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',      // Nút chính - màu xanh
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',    // Nút phụ - màu xám
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',   // Nút thành công - màu xanh lá
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',          // Nút nguy hiểm - màu đỏ
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500', // Nút cảnh báo - màu vàng
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500', // Nút viền
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500'   // Nút trong suốt
  };
  
  // CSS classes cho các kích thước khác nhau
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',    // Nhỏ
    md: 'px-4 py-2 text-sm',      // Trung bình
    lg: 'px-6 py-3 text-base',    // Lớn
    xl: 'px-8 py-4 text-lg'       // Rất lớn
  };

  // Kết hợp tất cả CSS classes
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}  // Vô hiệu hóa nếu disabled hoặc đang loading
      className={classes}
      {...props}
    >
      {loading ? (
        // Hiển thị spinner khi đang loading
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </div>
      ) : (
        // Hiển thị nội dung bình thường
        children
      )}
    </button>
  );
};

export default Button; 