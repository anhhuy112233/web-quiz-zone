/**
 * Component ExamForm - Form tạo và chỉnh sửa đề thi
 * Cho phép giáo viên tạo đề thi mới hoặc chỉnh sửa đề thi hiện có
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import ImportExcel from './ImportExcel';

/**
 * ExamForm component
 * @param {Object} exam - Thông tin đề thi (nếu đang chỉnh sửa)
 * @param {Function} onSubmit - Callback khi submit form
 * @returns {JSX.Element} Form tạo/chỉnh sửa đề thi
 */
const ExamForm = ({ exam, onSubmit }) => {
  const navigate = useNavigate();
  
  // State quản lý dữ liệu form, khởi tạo từ exam hiện tại hoặc giá trị mặc định
  const [formData, setFormData] = useState({
    title: exam?.title || '',                    // Tiêu đề bài thi
    description: exam?.description || '',        // Mô tả bài thi
    duration: exam?.duration || 60,              // Thời gian làm bài (phút)
    totalQuestions: exam?.totalQuestions || 0,   // Số câu hỏi
    startTime: exam?.startTime ? new Date(exam.startTime).toISOString().slice(0, 16) : '', // Thời gian bắt đầu
    endTime: exam?.endTime ? new Date(exam.endTime).toISOString().slice(0, 16) : '',       // Thời gian kết thúc
    isPublic: exam?.isPublic || false           // Có công khai không
  });
  
  // State quản lý danh sách câu hỏi
  const [questions, setQuestions] = useState(exam?.questions || []);
  
  // State quản lý trạng thái loading, lỗi và modal
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  /**
   * Handler khi thay đổi giá trị input trong form
   * @param {Event} e - Event object
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /**
   * Handler khi thay đổi thông tin câu hỏi
   * @param {number} index - Index của câu hỏi
   * @param {string} field - Trường cần thay đổi
   * @param {any} value - Giá trị mới
   */
  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setQuestions(newQuestions);
  };

  /**
   * Thêm câu hỏi mới vào danh sách
   */
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',           // Nội dung câu hỏi
        options: ['', '', '', ''], // 4 lựa chọn
        correctAnswer: 0,       // Index của đáp án đúng
        explanation: ''         // Giải thích đáp án
      }
    ]);
  };

  /**
   * Xóa câu hỏi theo index
   * @param {number} index - Index của câu hỏi cần xóa
   */
  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  /**
   * Handler khi import câu hỏi từ Excel thành công
   * @param {Array} importedQuestions - Danh sách câu hỏi đã import
   */
  const handleQuestionsImported = (importedQuestions) => {
    setQuestions(importedQuestions);
    // Cập nhật số câu hỏi
    setFormData(prev => ({
      ...prev,
      totalQuestions: importedQuestions.length
    }));
  };

  /**
   * Chuyển đổi local datetime-local (giờ máy người dùng) sang UTC ISO string
   * @param {string} localDateTimeStr - Chuỗi dạng 'YYYY-MM-DDTHH:mm' từ input
   * @returns {string} ISO string UTC
   */
  const toUTCISOString = (localDateTimeStr) => {
    if (!localDateTimeStr) return '';
    const [date, time] = localDateTimeStr.split('T');
    const [year, month, day] = date.split('-');
    const [hour, minute] = time.split(':');
    // Tạo đối tượng Date với local time
    const localDate = new Date(year, month - 1, day, hour, minute);
    // Trả về ISO string (UTC)
    return localDate.toISOString();
  };

  /**
   * Handler khi submit form
   * @param {Event} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ==================== VALIDATION ====================
      // Kiểm tra thông tin cơ bản
      if (!formData.title || !formData.duration || !formData.startTime || !formData.endTime) {
        throw new Error('Vui lòng điền đầy đủ thông tin bài thi');
      }
      // Kiểm tra có câu hỏi không
      if (questions.length === 0) {
        throw new Error('Vui lòng thêm ít nhất một câu hỏi');
      }
      // Kiểm tra từng câu hỏi
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question) {
          throw new Error(`Vui lòng nhập câu hỏi ${i + 1}`);
        }
        if (q.options.some(opt => !opt)) {
          throw new Error(`Vui lòng nhập đầy đủ các lựa chọn cho câu hỏi ${i + 1}`);
        }
      }
      // ==================== SUBMIT ====================
      // Chuyển startTime, endTime từ local sang UTC ISO string trước khi gửi backend
      await onSubmit({
        ...formData,
        startTime: toUTCISOString(formData.startTime),
        endTime: toUTCISOString(formData.endTime),
        questions,
        status: 'scheduled',
      });
      // Chuyển về trang danh sách đề thi
      navigate('/teacher/exams');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hiển thị lỗi nếu có */}
      {error && <Alert type="danger" message={error} />}

      {/* ==================== THÔNG TIN CƠ BẢN ==================== */}
      <div className="space-y-4">
        {/* Tiêu đề bài thi */}
        <Input
          label="Tiêu đề bài thi"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        {/* Mô tả bài thi */}
        <Input
          label="Mô tả"
          name="description"
          value={formData.description}
          onChange={handleChange}
          type="textarea"
        />

        {/* Thời gian và số câu hỏi */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Thời gian làm bài (phút)"
            name="duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
            required
            min="1"
          />

          <Input
            label="Số câu hỏi"
            name="totalQuestions"
            type="number"
            value={formData.totalQuestions}
            onChange={handleChange}
            required
            min="1"
          />
        </div>

        {/* Thời gian bắt đầu và kết thúc */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Thời gian bắt đầu"
            name="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={handleChange}
            required
          />

          <Input
            label="Thời gian kết thúc"
            name="endTime"
            type="datetime-local"
            value={formData.endTime}
            onChange={handleChange}
            required
          />
        </div>

        {/* Checkbox công khai */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600"
          />
          <label className="ml-2 text-sm text-gray-600">
            Công khai bài thi
          </label>
        </div>
      </div>

      {/* ==================== DANH SÁCH CÂU HỎI ==================== */}
      <div className="space-y-4">
        {/* Header với các nút thao tác */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Danh sách câu hỏi</h3>
          <div className="flex space-x-2">
            {/* Nút import từ Excel */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowImportModal(true)}
            >
              📁 Import từ Excel
            </Button>
            {/* Nút thêm câu hỏi */}
            <Button
              type="button"
              variant="secondary"
              onClick={addQuestion}
            >
              Thêm câu hỏi
            </Button>
          </div>
        </div>

        {/* Thông tin số lượng câu hỏi */}
        {questions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">📊</span>
              <span className="text-sm font-medium text-blue-800">
                Tổng cộng: {questions.length} câu hỏi
              </span>
            </div>
          </div>
        )}

        {/* Render từng câu hỏi */}
        {questions.map((question, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            {/* Header câu hỏi với nút xóa */}
            <div className="flex justify-between items-start">
              <h4 className="text-md font-medium">Câu hỏi {index + 1}</h4>
              <Button
                type="button"
                variant="danger"
                size="small"
                onClick={() => removeQuestion(index)}
              >
                Xóa
              </Button>
            </div>

            {/* Nội dung câu hỏi */}
            <Input
              label="Câu hỏi"
              value={question.question}
              onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
              required
            />

            {/* Các lựa chọn */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Các lựa chọn
              </label>
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center space-x-2">
                  {/* Radio button để chọn đáp án đúng */}
                  <input
                    type="radio"
                    name={`correctAnswer_${index}`}
                    checked={question.correctAnswer === optIndex}
                    onChange={() => handleQuestionChange(index, 'correctAnswer', optIndex)}
                    className="h-4 w-4 text-primary-600"
                  />
                  {/* Input cho lựa chọn */}
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...question.options];
                      newOptions[optIndex] = e.target.value;
                      handleQuestionChange(index, 'options', newOptions);
                    }}
                    required
                  />
                </div>
              ))}
            </div>

            {/* Giải thích đáp án */}
            <Input
              label="Giải thích đáp án"
              value={question.explanation}
              onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
              type="textarea"
            />
          </div>
        ))}
      </div>

      {/* ==================== CÁC NÚT THAO TÁC ==================== */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/teacher/exams')}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {exam ? 'Cập nhật bài thi' : 'Tạo bài thi'}
        </Button>
      </div>

      {/* Modal import Excel */}
      {showImportModal && (
        <ImportExcel
          onQuestionsImported={handleQuestionsImported}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </form>
  );
};

export default ExamForm; 