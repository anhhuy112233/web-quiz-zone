/**
 * File utility cho xử lý ngày tháng
 * Chứa các helper functions để format và hiển thị thời gian
 */

/**
 * Format date thành chuỗi theo định dạng Việt Nam
 * Hiển thị ngày/tháng/năm giờ:phút
 * @param {Date|string} date - Ngày cần format
 * @returns {string} Chuỗi ngày đã format hoặc chuỗi rỗng nếu không có date
 */
export const formatDate = (date) => {
  // Trả về chuỗi rỗng nếu không có date
  if (!date) return '';
  
  // Chuyển đổi thành Date object
  const d = new Date(date);
  
  // Format theo locale Việt Nam
  return d.toLocaleString('vi-VN', {
    year: 'numeric',    // Năm dạng số (2024)
    month: '2-digit',   // Tháng 2 chữ số (01-12)
    day: '2-digit',     // Ngày 2 chữ số (01-31)
    hour: '2-digit',    // Giờ 2 chữ số (00-23)
    minute: '2-digit'   // Phút 2 chữ số (00-59)
  });
}; 