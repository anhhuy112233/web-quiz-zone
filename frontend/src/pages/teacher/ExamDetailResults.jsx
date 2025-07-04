import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { getAuthHeaders } from '../../utils/api';

const ExamDetailResults = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchExamResults();
  }, [examId]);

  const fetchExamResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/results/exam/${examId}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể tải kết quả bài thi');
      
      setExam(data.data.exam);
      setResults(data.data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudentResult = (result) => {
    setSelectedStudent(result);
  };

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} onClose={() => setError('')} />;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kết quả bài thi: {exam?.title}</h1>
        <Button variant="secondary" onClick={() => navigate('/teacher/results')}>
          Quay về danh sách
        </Button>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">Tổng số học sinh</p>
            <p className="text-2xl font-bold text-blue-600">{results.length}</p>
          </div>
        </Card>
        <Card className="bg-green-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">Số học sinh hoàn thành</p>
            <p className="text-2xl font-bold text-green-600">
              {results.filter(r => r.status === 'completed').length}
            </p>
          </div>
        </Card>
        <Card className="bg-purple-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">Điểm trung bình</p>
            <p className="text-2xl font-bold text-purple-600">
              {Math.round(
                results
                  .filter(r => r.status === 'completed')
                  .reduce((acc, curr) => acc + curr.score, 0) / 
                results.filter(r => r.status === 'completed').length || 0
              )}%
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách học sinh */}
        <div className="lg:col-span-1">
          <Card title="Danh sách học sinh">
            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={result._id}
                  className={`p-3 rounded cursor-pointer hover:bg-gray-50 ${
                    selectedStudent?._id === result._id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleViewStudentResult(result)}
                >
                  <div className="font-medium">{result.user.name}</div>
                  <div className="text-sm text-gray-600">
                    Điểm: {result.correctAnswers}/{result.totalQuestions} ({result.score}%)
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(result.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Chi tiết bài làm */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <Card title={`Chi tiết bài làm của ${selectedStudent.user.name}`}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Điểm số</p>
                    <p className="text-xl font-bold">
                      {selectedStudent.correctAnswers}/{selectedStudent.totalQuestions} ({selectedStudent.score}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Thời gian làm bài</p>
                    <p className="text-xl font-bold">
                      {Math.round(
                        (new Date(selectedStudent.endTime) - new Date(selectedStudent.startTime)) / 60000
                      )} phút
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedStudent.answers.map((answer, index) => {
                    const question = exam.questions.find(q => q._id.toString() === answer.questionId.toString());
                    if (!question) return null;
                    
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
                                answer.selectedAnswer === optIndex && optIndex === question.correctAnswer
                                  ? 'bg-green-100 border border-green-500'
                                  : answer.selectedAnswer === optIndex
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
                            <span>
                              {String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}
                            </span>
                          </div>
                          {question.explanation && (
                            <div className="text-sm bg-gray-50 p-3 rounded">
                              <span className="font-medium text-blue-600">Giải thích: </span>
                              <span>{question.explanation}</span>
                            </div>
                          )}
                          <div className="text-sm">
                            <span className="font-medium">Đáp án của học sinh: </span>
                            <span className={answer.selectedAnswer === question.correctAnswer ? 'text-green-600' : 'text-red-600'}>
                              {answer.selectedAnswer === question.correctAnswer ? '✓ Đúng' : '✗ Sai'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <p className="text-center text-gray-500">Chọn một học sinh để xem chi tiết bài làm</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamDetailResults; 