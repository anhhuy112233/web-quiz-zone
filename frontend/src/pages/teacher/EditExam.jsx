/**
 * Component EditExam - Trang chỉnh sửa đề thi cho giáo viên
 * Cho phép giáo viên chỉnh sửa thông tin và nội dung của đề thi đã tạo
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import ExamForm from '../../components/teacher/ExamForm';
import { getAuthHeaders, getApiUrl } from '../../utils/api';

/**
 * EditExam component
 * @returns {JSX.Element} Trang chỉnh sửa đề thi với form và validation
 */
const EditExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State quản lý dữ liệu đề thi và trạng thái
  const [exam, setExam] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Effect để fetch thông tin đề thi khi id thay đổi
  useEffect(() => {
    fetchExam();
  }, [id]);

  /**
   * Fetch thông tin đề thi cần chỉnh sửa
   */
  const fetchExam = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl(`exams/${id}`), {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải thông tin đề thi');
      }

      const exam = data.data.exam;
      setExam(exam);
    } catch (error) {
      console.error('Error fetching exam:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý submit form chỉnh sửa đề thi
   * @param {Object} formData - Dữ liệu form từ ExamForm component
   */
  const handleSubmit = async (formData) => {
    try {
      setSubmitLoading(true);
      
      // Gọi API cập nhật đề thi
      const response = await fetch(getApiUrl(`exams/${id}`), {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Không thể cập nhật đề thi');
      }

      // Chuyển hướng về trang quản lý đề thi sau khi cập nhật thành công
      navigate('/teacher/exams');
    } catch (error) {
      console.error('Error updating exam:', error);
      setError(error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <Loading size="lg" text="Đang tải thông tin đề thi..." />
        </div>
      </div>
    );
  }

  // Hiển thị thông báo khi không tìm thấy đề thi
  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Không tìm thấy bài thi
            </h3>
            <p className="text-gray-600 mb-6">
              Bài thi bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <button
              onClick={() => navigate('/teacher/exams')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại danh sách đề thi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ==================== HEADER SECTION ==================== */}
        <div className="text-center mb-8">
          {/* Icon header */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Chỉnh sửa bài thi
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Cập nhật thông tin bài thi và các câu hỏi
          </p>
          {exam.title && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">{exam.title}</span>
            </div>
          )}
        </div>

        {/* ==================== ERROR ALERT ==================== */}
        {error && (
          <div className="mb-6">
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
            />
          </div>
        )}

        {/* ==================== FORM CONTAINER ==================== */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header của form */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Thông tin bài thi
            </h2>
          </div>
          
          {/* Nội dung form */}
          <div className="p-6">
            <ExamForm
              exam={exam}
              onSubmit={handleSubmit}
              loading={submitLoading}
            />
          </div>
        </div>

        {/* ==================== LOADING OVERLAY ==================== */}
        {submitLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-xl">
              <Loading size="md" />
              <span className="text-gray-700 font-medium">Đang cập nhật bài thi...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditExam; 