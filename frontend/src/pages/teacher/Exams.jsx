/**
 * Component Exams - Trang quản lý đề thi cho giáo viên
 * Hiển thị danh sách đề thi của giáo viên với các thao tác CRUD
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import ExamList from '../../components/teacher/ExamList';
import { getAuthHeaders, createApiUrl } from '../../utils/api';

/**
 * Exams component
 * @returns {JSX.Element} Trang quản lý đề thi với danh sách và thao tác
 */
const Exams = () => {
  // State quản lý danh sách đề thi và trạng thái
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Effect để fetch danh sách đề thi khi component mount
  useEffect(() => {
    fetchExams();
  }, []);

  /**
   * Fetch danh sách đề thi của giáo viên hiện tại
   */
  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch(createApiUrl('/api/exams'), {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải danh sách đề thi');
      }

      setExams(data.data.exams || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xóa đề thi với xác nhận từ người dùng
   * @param {string} examId - ID của đề thi cần xóa
   */
  const handleDelete = async (examId) => {
    // Hiển thị dialog xác nhận trước khi xóa
    if (!window.confirm('Bạn có chắc chắn muốn xóa đề thi này?')) {
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await fetch(createApiUrl(`/api/exams/${examId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Không thể xóa đề thi');
      }

      // Cập nhật state sau khi xóa thành công
      setExams(exams.filter(exam => exam._id !== examId));
      setSuccess('Đề thi đã được xóa thành công');
    } catch (error) {
      console.error('Error deleting exam:', error);
      setError(error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loading size="lg" text="Đang tải danh sách bài thi..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ==================== HEADER SECTION ==================== */}
        <div className="text-center mb-8">
          {/* Icon header */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Quản lý bài thi
          </h1>
          <p className="text-gray-600">
            Tổng cộng <span className="font-semibold text-green-600">{exams.length}</span> đề thi
          </p>
        </div>

        {/* ==================== ACTION BUTTON ==================== */}
        <div className="text-center mb-8">
          <Link to="/teacher/create-exam">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tạo bài thi mới
            </Button>
          </Link>
        </div>

        {/* ==================== ALERTS ==================== */}
        {/* Hiển thị lỗi */}
        {error && (
          <div className="mb-6">
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
            />
          </div>
        )}

        {/* Hiển thị thông báo thành công */}
        {success && (
          <div className="mb-6">
            <Alert
              type="success"
              message={success}
              onClose={() => setSuccess('')}
            />
          </div>
        )}

        {/* ==================== CONTENT ==================== */}
        {/* Hiển thị khi chưa có đề thi nào */}
        {exams.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            {/* Icon empty state */}
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Chưa có bài thi nào
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Bắt đầu tạo bài thi mới để quản lý và theo dõi kết quả của học sinh
            </p>
            <Link to="/teacher/create-exam">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tạo bài thi đầu tiên
              </Button>
            </Link>
          </div>
        ) : (
          /* Hiển thị danh sách đề thi */
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header của danh sách */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Danh sách bài thi ({exams.length})
              </h2>
            </div>
            {/* Nội dung danh sách */}
            <div className="p-6">
              <ExamList
                exams={exams}
                onDelete={handleDelete}
              />
            </div>
          </div>
        )}

        {/* ==================== LOADING OVERLAY ==================== */}
        {/* Overlay loading khi đang xóa đề thi */}
        {deleteLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-xl">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span className="text-gray-700 font-medium">Đang xóa đề thi...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Exams; 