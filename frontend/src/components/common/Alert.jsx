/**
 * Component Alert - Thông báo với các loại khác nhau
 * Sử dụng để hiển thị thông báo thành công, lỗi, cảnh báo, thông tin
 */

import React from 'react';

/**
 * Alert component
 * @param {string} type - Loại alert (success, error, warning, info)
 * @param {string} title - Tiêu đề của alert
 * @param {string} message - Nội dung thông báo
 * @param {Function} onClose - Handler khi đóng alert
 * @param {string} className - CSS classes bổ sung
 * @param {React.ReactNode} children - Nội dung tùy chỉnh
 * @returns {JSX.Element} Alert component với icon và styling phù hợp
 */
const Alert = ({
  type = 'info',
  title, 
  message,
  onClose,
  className = '',
  children 
}) => {
  // CSS classes cơ bản cho alert
  const baseClasses = 'p-4 rounded-md border';
  
  // CSS classes cho từng loại alert
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',  // Xanh lá - thành công
    error: 'bg-red-50 border-red-200 text-red-800',          // Đỏ - lỗi
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800', // Vàng - cảnh báo
    info: 'bg-blue-50 border-blue-200 text-blue-800'         // Xanh dương - thông tin
  };
  
  // CSS classes cho icon của từng loại
  const iconClasses = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  };
  
  // Kết hợp tất cả classes
  const classes = `${baseClasses} ${typeClasses[type]} ${className}`;
  
  // Icons cho từng loại alert
  const icons = {
    // Icon checkmark cho success
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    // Icon X cho error
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    // Icon cảnh báo cho warning
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    // Icon thông tin cho info
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <div className={classes}>
      <div className="flex">
        {/* Icon bên trái */}
        <div className={`flex-shrink-0 ${iconClasses[type]}`}>
          {icons[type]}
        </div>
        
        {/* Nội dung chính */}
        <div className="ml-3 flex-1">
          {/* Tiêu đề (nếu có) */}
          {title && (
            <h3 className="text-sm font-medium">
              {title}
            </h3>
          )}
          {/* Nội dung thông báo */}
          {(message || children) && (
            <div className="mt-2 text-sm">
              {message || children}
            </div>
          )}
        </div>
        
        {/* Nút đóng (nếu có) */}
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${typeClasses[type].replace('bg-', 'hover:bg-').replace(' border-', ' focus:ring-')}`}
            >
              {/* Icon X để đóng */}
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert; 