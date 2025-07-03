import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { getAuthHeaders } from '../../utils/api';
import ExamForm from '../../components/teacher/ExamForm';

const CreateExam = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/exams', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi tạo bài thi');
      }

      navigate('/teacher/exams');
    } catch (err) {
      console.error('Create exam error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Tạo bài thi mới
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Điền thông tin bài thi và thêm các câu hỏi.
        </p>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      <ExamForm
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
};

export default CreateExam; 