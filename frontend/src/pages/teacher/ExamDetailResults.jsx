/**
 * Component ExamDetailResults - Trang chi tiết kết quả đề thi cho giáo viên
 * Hiển thị chi tiết kết quả của từng học sinh trong một đề thi cụ thể
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { getAuthHeaders } from '../../utils/api';

/**
 * ExamDetailResults component
 * @returns {JSX.Element} Trang chi tiết kết quả với thống kê và phân tích từng bài làm
 */
const ExamDetailResults = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  // State quản lý dữ liệu và trạng thái
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Effect để fetch kết quả đề thi khi examId thay đổi
  useEffect(() => {
    fetchExamResults();
  }, [examId]);

  /**
   * Fetch kết quả chi tiết của đề thi
   */
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

  /**
   * Xử lý khi chọn học sinh để xem chi tiết bài làm
   * @param {Object} result - Kết quả của học sinh được chọn
   */
  const handleViewStudentResult = (result) => {
    setSelectedStudent(result);
  };

  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) return <Loading />;
  
  // Hiển thị lỗi nếu có
  if (error) return <Alert type="error" message={error} onClose={() => setError('')} />;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* ==================== HEADER ==================== */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kết quả bài thi: {exam?.title}</h1>
        <Button variant="secondary" onClick={() => navigate('/teacher/results')}>
          Quay về danh sách
        </Button>
      </div>

      {/* ==================== STATISTICS OVERVIEW ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card tổng số học sinh */}
        <Card className="bg-blue-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">Tổng số học sinh</p>
            <p className="text-2xl font-bold text-blue-600">{results.length}</p>
          </div>
        </Card>
        
        {/* Card số học sinh hoàn thành */}
        <Card className="bg-green-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">Số học sinh hoàn thành</p>
            <p className="text-2xl font-bold text-green-600">
              {results.filter(r => r.status === 'completed').length}
            </p>
          </div>
        </Card>
        
        {/* Card điểm trung bình */}
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

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ==================== STUDENT LIST ==================== */}
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

        {/* ==================== DETAILED ANSWERS ==================== */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <Card title={`Chi tiết bài làm của ${selectedStudent.user.name}`}>
              <div className="space-y-4">
                {/* Thông tin tổng quan của học sinh */}
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

                {/* Chi tiết từng câu trả lời */}
                <div className="space-y-4">
                  {selectedStudent.answers.map((answer, index) => {
                    const question = exam.questions.find(q => q._id.toString() === answer.questionId.toString());
                    if (!question) return null;
                    
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        {/* Nội dung câu hỏi */}
                        <div className="flex items-start gap-2">
                          <span className="font-semibold">Câu {index + 1}:</span>
                          <p className="flex-1">{question.question}</p>
                        </div>
                        
                        {/* Các lựa chọn với màu sắc phân biệt */}
                        <div className="mt-3 space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div 
                              key={optIndex}
                              className={`p-2 rounded ${
                                answer.selectedAnswer === optIndex && optIndex === question.correctAnswer
                                  ? 'bg-green-100 border border-green-500'  // Đáp án đúng và học sinh chọn đúng
                                  : answer.selectedAnswer === optIndex
                                  ? 'bg-red-100 border border-red-500'      // Học sinh chọn sai
                                  : optIndex === question.correctAnswer
                                  ? 'bg-green-100 border border-green-500'  // Đáp án đúng (học sinh không chọn)
                                  : 'bg-gray-50'                            // Các đáp án khác
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

                        {/* Thông tin phân tích câu trả lời */}
                        <div className="mt-4 space-y-2">
                          {/* Đáp án đúng */}
                          <div className="text-sm">
                            <span className="font-medium text-green-600">Đáp án đúng: </span>
                            <span>
                              {String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}
                            </span>
                          </div>
                          
                          {/* Giải thích (nếu có) */}
                          {question.explanation && (
                            <div className="text-sm bg-gray-50 p-3 rounded">
                              <span className="font-medium text-blue-600">Giải thích: </span>
                              <span>{question.explanation}</span>
                            </div>
                          )}
                          
                          {/* Kết quả của học sinh */}
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
            /* Hiển thị khi chưa chọn học sinh */
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