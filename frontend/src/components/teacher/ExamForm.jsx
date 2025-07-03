import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import ImportExcel from './ImportExcel';

const ExamForm = ({ exam, onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: exam?.title || '',
    description: exam?.description || '',
    duration: exam?.duration || 60,
    totalQuestions: exam?.totalQuestions || 0,
    startTime: exam?.startTime ? new Date(exam.startTime).toISOString().slice(0, 16) : '',
    endTime: exam?.endTime ? new Date(exam.endTime).toISOString().slice(0, 16) : '',
    isPublic: exam?.isPublic || false
  });
  const [questions, setQuestions] = useState(exam?.questions || []);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionsImported = (importedQuestions) => {
    setQuestions(importedQuestions);
    setFormData(prev => ({
      ...prev,
      totalQuestions: importedQuestions.length
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form data
      if (!formData.title || !formData.duration || !formData.startTime || !formData.endTime) {
        throw new Error('Vui lòng điền đầy đủ thông tin bài thi');
      }

      if (questions.length === 0) {
        throw new Error('Vui lòng thêm ít nhất một câu hỏi');
      }

      // Validate questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question) {
          throw new Error(`Vui lòng nhập câu hỏi ${i + 1}`);
        }
        if (q.options.some(opt => !opt)) {
          throw new Error(`Vui lòng nhập đầy đủ các lựa chọn cho câu hỏi ${i + 1}`);
        }
      }

      await onSubmit({
        ...formData,
        questions,
        status: 'scheduled',
      });

      navigate('/teacher/exams');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert type="danger" message={error} />}

      <div className="space-y-4">
        <Input
          label="Tiêu đề bài thi"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <Input
          label="Mô tả"
          name="description"
          value={formData.description}
          onChange={handleChange}
          type="textarea"
        />

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

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Danh sách câu hỏi</h3>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowImportModal(true)}
            >
              📁 Import từ Excel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={addQuestion}
            >
              Thêm câu hỏi
            </Button>
          </div>
        </div>

        {/* Questions count info */}
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

        {questions.map((question, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
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

            <Input
              label="Câu hỏi"
              value={question.question}
              onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Các lựa chọn
              </label>
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`correctAnswer_${index}`}
                    checked={question.correctAnswer === optIndex}
                    onChange={() => handleQuestionChange(index, 'correctAnswer', optIndex)}
                    className="h-4 w-4 text-primary-600"
                  />
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

            <Input
              label="Giải thích đáp án"
              value={question.explanation}
              onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
              type="textarea"
            />
          </div>
        ))}
      </div>

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

      {/* Import Excel Modal */}
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