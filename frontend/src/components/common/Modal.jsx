/**
 * Component Modal - Popup dialog
 * Sử dụng để hiển thị nội dung trong popup với backdrop và keyboard navigation
 */

import React, { useEffect } from 'react';

/**
 * Modal component
 * @param {boolean} isOpen - Trạng thái mở/đóng modal
 * @param {Function} onClose - Handler khi đóng modal
 * @param {string} title - Tiêu đề của modal
 * @param {React.ReactNode} children - Nội dung bên trong modal
 * @param {string} size - Kích thước modal (sm, md, lg, xl, full)
 * @param {string} className - CSS classes bổ sung
 * @param {boolean} showCloseButton - Có hiển thị nút đóng không
 * @returns {JSX.Element|null} Modal component hoặc null nếu không mở
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  showCloseButton = true 
}) => {
  // Effect để xử lý keyboard navigation và scroll lock
  useEffect(() => {
    // Handler cho phím Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      // Thêm event listener cho phím Escape
      document.addEventListener('keydown', handleEscape);
      // Khóa scroll của body khi modal mở
      document.body.style.overflow = 'hidden';
    }

    // Cleanup khi component unmount hoặc modal đóng
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Không render gì nếu modal không mở
  if (!isOpen) return null;

  // Mapping kích thước với CSS classes
  const sizeClasses = {
    sm: 'max-w-md',      // Nhỏ (448px)
    md: 'max-w-lg',      // Trung bình (512px)
    lg: 'max-w-2xl',     // Lớn (672px)
    xl: 'max-w-4xl',     // Rất lớn (896px)
    full: 'max-w-full mx-4' // Full width với margin
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay - click để đóng modal */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal panel chính */}
        <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full ${className}`}>
          {/* Header với title và nút đóng */}
          {(title || showCloseButton) && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {/* Tiêu đề modal */}
                {title && (
                  <h3 className="text-lg font-medium text-gray-900">
                    {title}
                  </h3>
                )}
                {/* Nút đóng modal */}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {/* Icon X */}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Nội dung chính của modal */}
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal; 