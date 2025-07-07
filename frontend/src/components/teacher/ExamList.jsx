/**
 * Component ExamList - Danh sách đề thi cho giáo viên
 * Hiển thị danh sách đề thi dạng bảng với các thao tác CRUD
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import Modal from '../common/Modal';

/**
 * ExamList component
 * @param {Array} exams - Danh sách đề thi
 * @param {Function} onDelete - Callback khi xóa đề thi
 * @returns {JSX.Element} Bảng danh sách đề thi với modal xác nhận xóa
 */
const ExamList = ({ exams, onDelete }) => {
  // State quản lý modal xóa và đề thi cần xóa
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  /**
   * Lấy CSS class cho badge trạng thái
   * @param {string} status - Trạng thái đề thi
   * @returns {string} CSS classes
   */
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';      // Xám - nháp
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';      // Xanh dương - đã lên lịch
      case 'active':
        return 'bg-green-100 text-green-800';    // Xanh lá - đang diễn ra
      case 'completed':
        return 'bg-purple-100 text-purple-800';  // Tím - đã kết thúc
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Lấy text hiển thị cho trạng thái
   * @param {string} status - Trạng thái đề thi
   * @returns {string} Text hiển thị
   */
  const getStatusText = (status) => {
    switch (status) {
      case 'draft':
        return 'Nháp';
      case 'scheduled':
        return 'Đã lên lịch';
      case 'active':
        return 'Đang diễn ra';
      case 'completed':
        return 'Đã kết thúc';
      default:
        return 'Không xác định';
    }
  };

  /**
   * Format ngày tháng theo định dạng Việt Nam, luôn hiển thị giờ local Việt Nam
   * @param {string|Date} date - Ngày cần format
   * @returns {string} Ngày đã format
   */
  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh' // Luôn hiển thị theo giờ Việt Nam
    });
  };

  /**
   * Handler khi click nút xóa
   * @param {Object} exam - Đề thi cần xóa
   */
  const handleDeleteClick = (exam) => {
    setExamToDelete(exam);
    setDeleteModalOpen(true);
  };

  /**
   * Xác nhận xóa đề thi
   */
  const confirmDelete = () => {
    if (examToDelete) {
      onDelete(examToDelete._id);
      setDeleteModalOpen(false);
      setExamToDelete(null);
    }
  };

  /**
   * Hủy bỏ thao tác xóa
   */
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setExamToDelete(null);
  };

  /**
   * Kiểm tra có thể xóa đề thi không
   * @param {Object} exam - Đề thi cần kiểm tra
   * @returns {boolean} Có thể xóa hay không
   */
  const canDelete = (exam) => {
    // Chỉ cho phép xóa đề thi ở trạng thái draft hoặc scheduled (chưa có ai làm)
    return exam.status === 'draft' || exam.status === 'scheduled';
  };

  /**
   * Lấy style cho nút giám sát tùy theo trạng thái
   * @param {Object} exam - Đề thi
   * @returns {string} CSS classes
   */
  const getMonitorButtonStyle = (exam) => {
    // Màu sắc khác nhau tùy theo trạng thái bài thi
    if (exam.status === 'active') {
      return 'bg-green-600 hover:bg-green-700 text-white';  // Xanh lá khi đang diễn ra
    } else if (exam.status === 'completed') {
      return 'bg-purple-600 hover:bg-purple-700 text-white'; // Tím khi đã kết thúc
    } else {
      return 'bg-blue-600 hover:bg-blue-700 text-white';     // Xanh dương cho các trạng thái khác
    }
  };

  return (
    <>
      {/* ==================== BẢNG DANH SÁCH ĐỀ THI ==================== */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header của bảng */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số câu hỏi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tham gia
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          
          {/* Body của bảng */}
          <tbody className="bg-white divide-y divide-gray-200">
            {exams.map((exam) => (
              <tr key={exam._id} className="hover:bg-gray-50">
                {/* Cột tiêu đề */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {exam.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {exam.description}
                  </div>
                </td>
                
                {/* Cột thời gian */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    Bắt đầu: {formatDate(exam.startTime)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Kết thúc: {formatDate(exam.endTime)}
                  </div>
                </td>
                
                {/* Cột số câu hỏi */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {exam.totalQuestions} câu
                </td>
                
                {/* Cột trạng thái */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(exam.status)}`}>
                    {getStatusText(exam.status)}
                  </span>
                </td>
                
                {/* Cột số người tham gia */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {exam.participants?.length || 0} người
                </td>
                
                {/* Cột thao tác */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {/* Nút sửa */}
                    <Link to={`/teacher/exams/${exam._id}/edit`}>
                      <Button variant="secondary" size="small" className="hover:bg-blue-100">
                        ✏️ Sửa
                      </Button>
                    </Link>
                    
                    {/* Nút giám sát */}
                    <Link to={`/teacher/exams/${exam._id}/monitor`}>
                      <Button variant="primary" size="small" className={getMonitorButtonStyle(exam)}>
                        👁️ Giám sát
                      </Button>
                    </Link>
                    
                    {/* Nút xem kết quả */}
                    <Link to={`/teacher/exams/${exam._id}/results`}>
                      <Button variant="primary" size="small" className="hover:bg-green-100">
                        📊 Kết quả
                      </Button>
                    </Link>
                    
                    {/* Nút xóa (chỉ hiển thị nếu có thể xóa) */}
                    {canDelete(exam) && (
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleDeleteClick(exam)}
                        className="hover:bg-red-100"
                      >
                        🗑️ Xóa
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ==================== MODAL XÁC NHẬN XÓA ==================== */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        title="Xác nhận xóa đề thi"
      >
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-600">
              Bạn có chắc chắn muốn xóa đề thi này không?
            </p>
            
            {/* Hiển thị thông tin đề thi sẽ xóa */}
            {examToDelete && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-medium text-red-800">{examToDelete.title}</p>
                <p className="text-sm text-red-600 mt-1">
                  Trạng thái: {getStatusText(examToDelete.status)}
                </p>
                <p className="text-sm text-red-600">
                  Số câu hỏi: {examToDelete.totalQuestions} câu
                </p>
              </div>
            )}
            
            <p className="text-sm text-red-600 mt-3">
              ⚠️ Hành động này không thể hoàn tác!
            </p>
          </div>
          
          {/* Các nút thao tác */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={cancelDelete}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              Xóa đề thi
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ExamList; 