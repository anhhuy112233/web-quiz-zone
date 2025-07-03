import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { getAuthHeaders } from '../../utils/api';

const ExamResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      console.log('Fetching result for exam:', id);
      
      // Tìm result của user hiện tại cho bài thi này
      const response = await fetch(`http://localhost:5000/api/results?exam=${id}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      console.log('API response:', data);
      
      if (!response.ok) throw new Error(data.message || 'Không thể tải kết quả');
      
      // Lấy result completed mới nhất của user hiện tại
      const myResults = data.data.results.filter(r => r.status === 'completed');
      console.log('My completed results:', myResults);
      
      const myResult = myResults.length > 0 
        ? myResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
        : null;
      
      console.log('Selected result:', myResult);
      setResult(myResult);
    } catch (err) {
      console.error('Error fetching result:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Đang tải kết quả..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert type="error" message={error} onClose={() => setError('')} />
          <div className="mt-4 text-center">
            <Button variant="secondary" onClick={() => navigate('/student/exams')}>
              Quay về danh sách bài thi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert type="error" message="Không tìm thấy kết quả bài thi." />
          <div className="mt-4 text-center">
            <Button variant="secondary" onClick={() => navigate('/student/exams')}>
              Quay về danh sách bài thi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (score) => {
    if (score >= 90) return '🏆';
    if (score >= 80) return '🎉';
    if (score >= 70) return '👍';
    if (score >= 60) return '😊';
    if (score >= 50) return '😐';
    return '😔';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Kết quả bài thi: {result.exam?.title}</h1>
            <div className="flex items-center space-x-4">
              <span className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}%
              </span>
              <span className="text-3xl">{getScoreEmoji(result.score)}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/student/exams/${id}/detail-result`)}
            >
              Xem chi tiết
            </Button>
            <Button variant="secondary" onClick={() => navigate('/student/exams')}>
              Quay về danh sách
            </Button>
          </div>
        </div>
        
        {/* Thông tin tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Điểm số</p>
            <p className="text-2xl font-bold text-blue-600">{result.score}/{result.totalQuestions}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Thời gian làm bài</p>
            <p className="text-2xl font-bold text-green-600">
              {Math.round((new Date(result.endTime) - new Date(result.startTime)) / 60000)} phút
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Ngày làm bài</p>
            <p className="text-2xl font-bold text-purple-600">
              {new Date(result.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        {/* Tóm tắt câu trả lời */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Tóm tắt bài làm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Câu trả lời đúng</p>
              <p className="text-2xl font-bold text-green-600">{result.correctAnswers}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Câu trả lời sai</p>
              <p className="text-2xl font-bold text-red-600">{result.totalQuestions - result.correctAnswers}</p>
            </div>
          </div>
        </div>

        {/* Nút làm lại bài thi */}
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/student/exams/${id}/start?retry=1`)}
          >
            Làm lại bài thi
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ExamResult; 