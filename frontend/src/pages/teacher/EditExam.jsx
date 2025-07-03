import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import ExamForm from '../../components/teacher/ExamForm';
import { getAuthHeaders } from '../../utils/api';

const EditExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchExam();
  }, [id]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/exams/${id}`, {
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

  const handleSubmit = async (formData) => {
    try {
      setSubmitLoading(true);
      const response = await fetch(`/api/exams/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Không thể cập nhật đề thi');
      }

      navigate('/teacher/exams');
    } catch (error) {
      console.error('Error updating exam:', error);
      setError(error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Chỉnh sửa bài thi
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Cập nhật thông tin bài thi và các câu hỏi.
        </p>
      </div>

      {error && (
        <Alert
          type="danger"
          message={error}
          onClose={() => setError('')}
        />
      )}

      <ExamForm
        exam={exam}
        onSubmit={handleSubmit}
        loading={submitLoading}
      />
    </div>
  );
};

export default EditExam; 