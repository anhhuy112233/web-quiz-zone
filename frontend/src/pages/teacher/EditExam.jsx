/**
 * Component EditExam - Trang chỉnh sửa đề thi cho giáo viên
 * Cho phép giáo viên chỉnh sửa thông tin và nội dung của đề thi đã tạo
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import ExamForm from '../../components/teacher/ExamForm';
import { getAuthHeaders, createApiUrl } from '../../utils/api';

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
      const response = await fetch(createApiUrl(`/api/exams/${id}`), {
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
      const response = await fetch(createApiUrl(`/api/exams/${id}`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
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
    return <Loading />;
  }

  // Hiển thị thông báo khi không tìm thấy đề thi
  if (!exam) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">
          Không tìm thấy bài thi
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Bài thi bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* ==================== HEADER ==================== */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Chỉnh sửa bài thi
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Cập nhật thông tin bài thi và các câu hỏi.
        </p>
      </div>

      {/* ==================== ERROR ALERT ==================== */}
      {error && (
        <Alert
          type="danger"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* ==================== EXAM FORM ==================== */}
      <ExamForm
        exam={exam}
        onSubmit={handleSubmit}
        loading={submitLoading}
      />
    </div>
  );
};

export default EditExam; 