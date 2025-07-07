/**
 * Component CreateExam - Trang tạo đề thi mới cho giáo viên
 * Cho phép giáo viên tạo đề thi mới với form nhập liệu chi tiết
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { getAuthHeaders, createApiUrl } from '../../utils/api';
import ExamForm from '../../components/teacher/ExamForm';

/**
 * CreateExam component
 * @returns {JSX.Element} Trang tạo đề thi mới với form và validation
 */
const CreateExam = () => {
  const navigate = useNavigate();
  
  // State quản lý trạng thái và lỗi
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Xử lý submit form tạo đề thi
   * @param {Object} formData - Dữ liệu form từ ExamForm component
   */
  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Gọi API tạo đề thi mới
      const response = await fetch(createApiUrl('/api/exams'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi tạo bài thi');
      }

      // Chuyển hướng về trang quản lý đề thi sau khi tạo thành công
      navigate('/teacher/exams');
    } catch (err) {
      console.error('Create exam error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ==================== HEADER SECTION ==================== */}
        <div className="text-center mb-8">
          {/* Icon header */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Tạo bài thi mới
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Thiết kế bài thi với các câu hỏi đa dạng và cấu hình thời gian phù hợp
          </p>
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
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Thông tin bài thi
            </h2>
          </div>
          
          {/* Nội dung form */}
          <div className="p-6">
            <ExamForm
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>
        </div>

        {/* ==================== LOADING OVERLAY ==================== */}
        {/* Overlay loading khi đang tạo đề thi */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <Loading size="md" />
              <span className="text-gray-700 font-medium">Đang tạo bài thi...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateExam; 