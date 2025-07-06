/**
 * Component Input - Trường nhập liệu chuẩn
 * Sử dụng để tạo các input field với style nhất quán và validation
 */

import React from 'react';

/**
 * Input component
 * @param {string} type - Loại input (text, email, password, etc.)
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Giá trị hiện tại
 * @param {Function} onChange - Handler khi giá trị thay đổi
 * @param {string} name - Tên của input field
 * @param {string} id - ID của input field
 * @param {boolean} required - Có bắt buộc không
 * @param {boolean} disabled - Có bị vô hiệu hóa không
 * @param {string} error - Message lỗi
 * @param {string} label - Label cho input
 * @param {string} className - CSS classes bổ sung
 * @param {Object} props - Các props khác được truyền vào input
 * @returns {JSX.Element} Input component với label và error handling
 */
const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  id,
  required = false,
  disabled = false,
  error,
  label,
  className = '',
  ...props
}) => {
  // CSS classes cơ bản cho input
  const baseClasses = 'w-full px-3 py-2 border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
  
  // Classes cho trạng thái lỗi
  const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300';
  
  // Classes cho trạng thái disabled
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
  
  // Kết hợp tất cả classes
  const classes = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`;
  
  return (
    <div className="w-full">
      {/* Label cho input (nếu có) */}
      {label && (
        <label htmlFor={id || name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {/* Dấu * cho trường bắt buộc */}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input field */}
      <input
        type={type}
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={classes}
        {...props}
      />
      
      {/* Hiển thị message lỗi (nếu có) */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input; 