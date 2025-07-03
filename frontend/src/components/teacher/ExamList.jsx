import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import Modal from '../common/Modal';

const ExamList = ({ exams, onDelete }) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteClick = (exam) => {
    setExamToDelete(exam);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (examToDelete) {
      onDelete(examToDelete._id);
      setDeleteModalOpen(false);
      setExamToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setExamToDelete(null);
  };

  const canDelete = (exam) => {
    // Chỉ cho phép xóa đề thi ở trạng thái draft hoặc scheduled (chưa có ai làm)
    return exam.status === 'draft' || exam.status === 'scheduled';
  };

  const getMonitorButtonStyle = (exam) => {
    // Màu sắc khác nhau tùy theo trạng thái bài thi
    if (exam.status === 'active') {
      return 'bg-green-600 hover:bg-green-700 text-white';
    } else if (exam.status === 'completed') {
      return 'bg-purple-600 hover:bg-purple-700 text-white';
    } else {
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
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
        <tbody className="bg-white divide-y divide-gray-200">
          {exams.map((exam) => (
              <tr key={exam._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {exam.title}
                </div>
                <div className="text-sm text-gray-500">
                  {exam.description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  Bắt đầu: {formatDate(exam.startTime)}
                </div>
                <div className="text-sm text-gray-500">
                  Kết thúc: {formatDate(exam.endTime)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {exam.totalQuestions} câu
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(exam.status)}`}>
                    {getStatusText(exam.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {exam.participants?.length || 0} người
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Link to={`/teacher/exams/${exam._id}/edit`}>
                      <Button variant="secondary" size="small" className="hover:bg-blue-100">
                        ✏️ Sửa
                    </Button>
                  </Link>
                  <Link to={`/teacher/exams/${exam._id}/monitor`}>
                    <Button variant="primary" size="small" className={getMonitorButtonStyle(exam)}>
                      👁️ Giám sát
                    </Button>
                  </Link>
                  <Link to={`/teacher/exams/${exam._id}/results`}>
                      <Button variant="primary" size="small" className="hover:bg-green-100">
                        📊 Kết quả
                    </Button>
                  </Link>
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

      {/* Delete Confirmation Modal */}
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