import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { getAuthHeaders } from '../../utils/api';

const ExamDetailResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('ExamDetailResult mounted with id:', id);
    fetchResult();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    console.log('Component state changed:', { loading, error, result: !!result });
  }, [loading, error, result]);

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
        <Loading size="lg" text="Đang tải chi tiết kết quả..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert type="error" message={error} onClose={() => setError('')} />
          <div className="mt-4 text-center">
            <Button variant="secondary" onClick={() => navigate('/student/results')}>
              Quay về danh sách
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
            <Button variant="secondary" onClick={() => navigate('/student/results')}>
              Quay về danh sách
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Kiểm tra query ?retry=1 hoặc luôn cho phép làm lại
  const showRetry = location.search.includes('retry=1') || true;

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
          <Button variant="secondary" onClick={() => navigate('/student/results')}>
            Quay về danh sách
          </Button>
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

        {/* Chi tiết từng câu hỏi */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Chi tiết bài làm</h2>
          {result.exam?.questions?.map((question, index) => {
            const answer = result.answers[index];
            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <span className="font-semibold">Câu {index + 1}:</span>
                  <p className="flex-1">{question.question}</p>
                </div>
                
                <div className="mt-3 space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div 
                      key={optIndex}
                      className={`p-2 rounded ${
                        answer?.selectedAnswer === optIndex && optIndex === question.correctAnswer
                          ? 'bg-green-100 border border-green-500'
                          : answer?.selectedAnswer === optIndex
                          ? 'bg-red-100 border border-red-500'
                          : optIndex === question.correctAnswer
                          ? 'bg-green-100 border border-green-500'
                          : 'bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + optIndex)}. </span>
                      {option}
                      {optIndex === question.correctAnswer && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-green-600">Đáp án đúng: </span>
                    <span>{String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}</span>
                  </div>
                  {question.explanation && (
                    <div className="text-sm bg-gray-50 p-3 rounded">
                      <span className="font-medium text-blue-600">Giải thích: </span>
                      <span>{question.explanation}</span>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Kết quả của bạn: </span>
                    <span className={answer?.selectedAnswer === question.correctAnswer ? 'text-green-600' : 'text-red-600'}>
                      {answer?.selectedAnswer === question.correctAnswer ? '✓ Đúng' : '✗ Sai'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Các nút điều hướng */}
        <div className="flex gap-4 mt-6">
          {showRetry && (
            <Button variant="primary" onClick={() => navigate(`/student/exams/${id}/start`)}>
              Làm lại bài thi
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate('/student/results')}>
            Quay về danh sách
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ExamDetailResult; 