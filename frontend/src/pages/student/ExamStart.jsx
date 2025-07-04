import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socketClient from '../../utils/socket.js';
import { getAuthHeaders } from '../../utils/api.js';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const ExamStart = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const timerRef = useRef();
  const [submitting, setSubmitting] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [exitAction, setExitAction] = useState(null);
  const [showRestoreMessage, setShowRestoreMessage] = useState(false);

  useEffect(() => {
    fetchExam();
    setupSocketConnection();
    
    return () => {
      // Cleanup khi component unmount
      if (examStarted) {
        socketClient.leaveExam(id);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [id]);

  // Lưu trạng thái bài thi vào localStorage để phục hồi khi refresh
  useEffect(() => {
    if (examStarted && exam && answers.length > 0) {
      const examState = {
        examId: id,
        answers: answers,
        current: current,
        startTime: startTime,
        timeLeft: timeLeft
      };
      localStorage.setItem('examState', JSON.stringify(examState));
    }
  }, [examStarted, exam, answers, current, startTime, timeLeft, id]);

  // Xóa trạng thái bài thi khi hoàn thành
  useEffect(() => {
    if (exitAction === 'submit' || exitAction === 'exit') {
      localStorage.removeItem('examState');
    }
  }, [exitAction]);

  // Tự động ẩn thông báo phục hồi sau 5 giây
  useEffect(() => {
    if (showRestoreMessage) {
      const timer = setTimeout(() => {
        setShowRestoreMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showRestoreMessage]);

  const setupSocketConnection = () => {
    // Kết nối Socket.IO
    const socket = socketClient.connect();
    
    if (!socket) {
      console.warn('Failed to connect to Socket.IO server');
      return;
    }

    // Lắng nghe cập nhật thời gian từ server
    socketClient.on('timeUpdate', (data) => {
      if (data.examId === id) {
        setTimeLeft(data.remainingTime);
      }
    });

    // Lắng nghe thông báo từ giáo viên
    socketClient.on('notification', (data) => {
      console.log('Notification from teacher:', data.message);
    });
  };

  const fetchExam = async () => {
    try {
      setLoading(true);
      console.log('Starting exam for ID:', id);
      
      // Kiểm tra xem có trạng thái bài thi đã lưu không
      const savedState = localStorage.getItem('examState');
      if (savedState) {
        const examState = JSON.parse(savedState);
        if (examState.examId === id) {
          // Phục hồi trạng thái bài thi
          console.log('Restoring exam state from localStorage');
          setAnswers(examState.answers);
          setCurrent(examState.current);
          setStartTime(new Date(examState.startTime));
          setTimeLeft(examState.timeLeft);
          setExamStarted(true);
          setShowRestoreMessage(true);
          
          // Lấy thông tin bài thi
          const examResponse = await fetch(`http://localhost:5000/api/exams/${id}`, {
            headers: getAuthHeaders()
          });
          const examData = await examResponse.json();
          if (examResponse.ok) {
            setExam(examData.data.exam);
            // Tham gia lại phòng thi
            socketClient.joinExam(id);
            socketClient.examStarted(id, new Date(examState.startTime));
            setLoading(false);
            return;
          }
        }
      }
      
      // Bắt đầu làm bài mới (gọi API start)
      const response = await fetch(`http://localhost:5000/api/exams/${id}/start`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        // Nếu đã bắt đầu bài thi, chuyển hướng sang trang kết quả và hiển thị nút Làm lại
        if (data.message && (data.message.includes('bắt đầu bài thi này') || data.message.includes('chưa hoàn thành'))) {
          navigate(`/student/exams/${id}/result?retry=1`);
          return;
        }
        throw new Error(data.message || 'Không thể bắt đầu bài thi');
      }
      
      console.log('Exam started successfully:', data);
      setExam(data.data.result.exam);
      setAnswers(Array(data.data.result.exam.questions.length).fill(null));
      // Tính thời gian còn lại (phút -> giây)
      const now = new Date();
      const end = new Date(data.data.result.endTime);
      const remainingTime = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(remainingTime);
      setStartTime(now);
      
      // Tham gia phòng thi và báo cáo bắt đầu làm bài
      console.log('Joining exam room and starting exam...');
      socketClient.joinExam(id);
      socketClient.examStarted(id, now);
      setExamStarted(true);
      console.log('Exam events sent successfully');
    } catch (err) {
      console.error('Error starting exam:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Đếm ngược thời gian
  useEffect(() => {
    if (timeLeft <= 0) {
      if (exam && answers.length) {
        localStorage.removeItem('examState');
        handleSubmit();
      }
      return;
    }
    timerRef.current = setTimeout(() => {
      const newTimeLeft = timeLeft - 1;
      setTimeLeft(newTimeLeft);
      
      // Gửi cập nhật thời gian cho server mỗi 30 giây
      if (newTimeLeft % 30 === 0) {
        socketClient.timeUpdate(id, newTimeLeft);
      }
    }, 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, exam, answers.length, id]);

  const handleSelect = (qIdx, optIdx) => {
    console.log(`Student selecting answer: question ${qIdx}, option ${optIdx}`);
    
    const newAnswers = answers.map((a, i) => (i === qIdx ? optIdx : a));
    setAnswers(newAnswers);
    
    // Báo cáo câu trả lời cho giáo viên
    if (exam && exam.questions[qIdx]) {
      const timeSpent = Math.floor((new Date() - startTime) / 1000);
      console.log(`Submitting answer to server: questionId=${exam.questions[qIdx]._id}, answer=${optIdx}, timeSpent=${timeSpent}`);
      socketClient.submitAnswer(id, exam.questions[qIdx]._id, optIdx, timeSpent);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    try {
      // Tính điểm
      let correctAnswers = 0;
      const totalQuestions = exam.questions.length;
      const timeTaken = Math.floor((new Date() - startTime) / 1000);
      
      answers.forEach((answer, index) => {
        if (answer === exam.questions[index].correctAnswer) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / totalQuestions) * 100);

      // Báo cáo hoàn thành bài thi
      socketClient.examCompleted(id, score, totalQuestions, timeTaken);
      
      // Gửi đáp án lên backend
      const response = await fetch(`http://localhost:5000/api/exams/${id}/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          answers: answers.map((selectedAnswer, idx) => ({
            questionId: exam.questions[idx]._id,
            selectedAnswer
          }))
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Nộp bài thất bại');
      }
      
      // Rời phòng thi và xóa trạng thái
      localStorage.removeItem('examState');
      socketClient.leaveExam(id);
      navigate(`/student/exams/${id}/result`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm xử lý thoát trang và nộp bài
  const handleExitAndSubmit = async () => {
    setShowExitWarning(false);
    setExitAction('submit');
    await handleSubmit();
  };

  // Hàm xử lý thoát trang không nộp bài
  const handleExitWithoutSubmit = () => {
    setShowExitWarning(false);
    setExitAction('exit');
    localStorage.removeItem('examState');
    socketClient.leaveExam(id);
    navigate('/student/exams');
  };

  // Hàm xử lý ở lại tiếp tục thi
  const handleStayAndContinue = () => {
    setShowExitWarning(false);
    setExitAction(null);
  };

  // Phát hiện hoạt động đáng ngờ và xử lý thoát trang
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && examStarted) {
        socketClient.suspiciousActivity(id, 'Tab switching', 'Student switched to another tab');
      }
    };

    const handleBeforeUnload = (e) => {
      if (examStarted && !showExitWarning) {
        // Hiển thị cảnh báo mặc định của trình duyệt
        e.preventDefault();
        e.returnValue = 'Bạn có chắc chắn muốn thoát khỏi bài thi?';
        return 'Bạn có chắc chắn muốn thoát khỏi bài thi?';
      }
    };

    const handlePopState = (e) => {
      if (examStarted && !showExitWarning) {
        e.preventDefault();
        setShowExitWarning(true);
        // Push lại state để ngăn chặn navigation
        window.history.pushState(null, '', window.location.href);
      }
    };

    const handleKeyDown = (e) => {
      // Ngăn chặn F5 và Ctrl+R
      if (examStarted && (e.key === 'F5' || (e.ctrlKey && e.key === 'r'))) {
        e.preventDefault();
        setShowExitWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [examStarted, id, showExitWarning]);

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} onClose={() => setError('')} />;
  if (!exam || !exam.questions || !Array.isArray(exam.questions)) {
    return <Alert type="error" message="Bài thi không hợp lệ hoặc đã bị xóa." />;
  }

  const q = exam.questions[current];

  // Format thời gian
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Thông báo phục hồi trạng thái */}
      {showRestoreMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-blue-400 text-xl">🔄</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Trạng thái bài thi đã được phục hồi
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Các câu trả lời và thời gian làm bài của bạn đã được khôi phục.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setShowRestoreMessage(false)}
                className="text-blue-400 hover:text-blue-600"
              >
                <span className="sr-only">Đóng</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header với thông tin bài thi */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
            <p className="text-gray-600 mt-1">Câu {current + 1} / {exam.questions.length}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{formatTime(timeLeft)}</div>
            <div className="text-sm text-gray-500">Thời gian còn lại</div>
          </div>
        </div>
      </div>

      {/* Câu hỏi hiện tại */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{q.question}</h2>
          <div className="space-y-3">
            {q.options.map((opt, idx) => (
              <label
                key={idx}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  answers[current] === idx
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`q_${current}`}
                  checked={answers[current] === idx}
                  onChange={() => handleSelect(current, idx)}
                  className="sr-only"
                  disabled={submitting}
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  answers[current] === idx
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {answers[current] === idx && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="text-gray-900">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="secondary"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0 || submitting}
            className="px-6 py-2"
          >
            ← Câu trước
          </Button>
          
          <div className="flex space-x-2">
            {exam.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  idx === current
                    ? 'bg-blue-600 text-white'
                    : answers[idx] !== null
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            onClick={() => setCurrent((c) => Math.min(exam.questions.length - 1, c + 1))}
            disabled={current === exam.questions.length - 1 || submitting}
            className="px-6 py-2"
          >
            Câu tiếp →
          </Button>
        </div>
      </div>

      {/* Nút nộp bài */}
      <div className="text-center">
        <Button
          variant="primary"
          onClick={() => {
            if (window.confirm('Bạn chắc chắn muốn nộp bài?')) handleSubmit();
          }}
          disabled={submitting}
          className="px-8 py-3 text-lg"
        >
          {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
        </Button>
      </div>

      {/* Modal cảnh báo thoát trang */}
      <Modal
        isOpen={showExitWarning}
        onClose={handleStayAndContinue}
        title="⚠️ Cảnh báo thoát trang"
        size="md"
        showCloseButton={false}
      >
        <div className="text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bạn đang cố gắng thoát khỏi bài thi
            </h3>
            <p className="text-gray-600">
              Nếu bạn thoát bây giờ, bài thi sẽ được nộp với những câu trả lời hiện tại.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={handleStayAndContinue}
              className="flex-1"
            >
              🔄 Ở lại tiếp tục thi
            </Button>
            <Button
              variant="primary"
              onClick={handleExitAndSubmit}
              className="flex-1"
            >
              📝 Thoát và nộp bài
            </Button>
          </div>
          
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={handleExitWithoutSubmit}
              className="text-sm"
            >
              🚪 Thoát không nộp bài
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExamStart; 