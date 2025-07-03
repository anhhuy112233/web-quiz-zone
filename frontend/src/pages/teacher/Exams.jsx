import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import ExamList from '../../components/teacher/ExamList';
import { getAuthHeaders } from '../../utils/api';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/exams', {
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

  const handleDelete = async (examId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đề thi này?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/exams/${examId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Không thể xóa đề thi');
      }

      setExams(exams.filter(exam => exam._id !== examId));
      setSuccess('Đề thi đã được xóa thành công');
    } catch (error) {
      console.error('Error deleting exam:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Quản lý bài thi
        </h1>
          <p className="mt-1 text-sm text-gray-500">
            Tổng cộng {exams.length} đề thi
          </p>
        </div>
        <Link to="/teacher/create-exam">
          <Button className="flex items-center space-x-2">
            <span>➕</span>
            <span>Tạo bài thi mới</span>
          </Button>
        </Link>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess('')}
        />
      )}

      {exams.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">📝</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có bài thi nào
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Bắt đầu tạo bài thi mới để quản lý.
          </p>
          <Link to="/teacher/create-exam">
            <Button>
              Tạo bài thi đầu tiên
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
        <ExamList
          exams={exams}
          onDelete={handleDelete}
        />
        </div>
      )}

      {/* Loading overlay khi đang xóa */}
      {deleteLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Đang xóa đề thi...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams; 