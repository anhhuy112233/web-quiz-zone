/**
 * Component Monitor - Trang giám sát real-time cho giáo viên
 * Theo dõi hoạt động của học sinh trong thời gian thực khi làm bài thi
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import socketClient from '../../utils/socket.js';
import { getAuthHeaders, createApiUrl } from '../../utils/api.js';
import { getCurrentSessionInfo, clearAllSessions } from '../../utils/sessionManager.js';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

/**
 * Monitor component
 * @returns {JSX.Element} Trang giám sát real-time với Socket.IO và thống kê chi tiết
 */
const Monitor = () => {
  const { examId } = useParams();
  
  // State quản lý dữ liệu đề thi và trạng thái
  const [exam, setExam] = useState(null);
  const [examStats, setExamStats] = useState({
    activeStudents: 0,
    activeTeachers: 0,
    startTime: null,
    endTime: null
  });
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  
  // Refs để tránh duplicate events và quản lý counter
  const socketSetupRef = useRef(false);
  const activityCounterRef = useRef(0);

  // Effect để setup component và socket connection
  useEffect(() => {
    fetchExamDetails();
    
    // Chỉ setup socket một lần để tránh duplicate events
    if (!socketSetupRef.current) {
      setupSocketConnection();
      socketSetupRef.current = true;
    }
    
    return () => {
      // Cleanup khi component unmount
      if (isMonitoring) {
        socketClient.leaveExam(examId);
      }
    };
  }, [examId]);

  /**
   * Fetch thông tin chi tiết của đề thi
   */
  const fetchExamDetails = async () => {
    try {
      console.log('Fetching exam details for:', examId);
              const response = await fetch(createApiUrl(`/api/exams/${examId}`), {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch exam details');
      }
      
      const examData = await response.json();
      console.log('Exam data:', examData);
      setExam(examData);
    } catch (error) {
      setError('Failed to load exam details');
      console.error('Error fetching exam:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Setup kết nối Socket.IO và lắng nghe các sự kiện real-time
   */
  const setupSocketConnection = () => {
    console.log('Setting up Socket.IO connection...');
    
    // Kết nối Socket.IO
    const socket = socketClient.connect();
    
    if (!socket) {
      setError('Failed to connect to real-time monitoring');
      console.error('Socket connection failed');
      return;
    }

    // Kiểm tra trạng thái kết nối
    if (socket.connected) {
      console.log('Socket.IO connected successfully');
      setSocketStatus('connected');
    } else {
      console.log('Socket.IO not connected yet');
      setSocketStatus('connecting');
    }

    // ==================== SOCKET EVENT LISTENERS ====================
    
    // Lắng nghe sự kiện kết nối/ngắt kết nối
    socketClient.on('connect', () => {
      console.log('Socket.IO connected!');
      setSocketStatus('connected');
    });

    socketClient.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setSocketStatus('disconnected');
    });

    // Lắng nghe sự kiện học sinh tham gia bài thi
    socketClient.on('userJoinedExam', (data) => {
      console.log('User joined exam:', data);
      if (data.examId === examId) {
        if (data.userRole === 'student') {
          setStudents(prev => {
            // Kiểm tra xem học sinh đã tồn tại chưa để tránh duplicate
            const existingStudent = prev.find(s => s.id === data.userId);
            if (existingStudent) {
              return prev; // Không thêm duplicate
            }
            return [...prev, {
              id: data.userId,
              name: data.userName,
              joinedAt: data.timestamp,
              status: 'active'
            }];
          });
        }
        addActivity(`Học sinh ${data.userName} đã tham gia bài thi`, 'info');
      }
    });

    // Lắng nghe sự kiện học sinh rời bài thi
    socketClient.on('userLeftExam', (data) => {
      console.log('User left exam:', data);
      if (data.examId === examId) {
        if (data.userRole === 'student') {
          setStudents(prev => prev.filter(student => student.id !== data.userId));
        }
        addActivity(`Học sinh ${data.userName} đã rời bài thi`, 'warning');
      }
    });

    // Lắng nghe sự kiện học sinh bắt đầu làm bài
    socketClient.on('examStarted', (data) => {
      console.log('Exam started:', data);
      if (data.examId === examId) {
        setStudents(prev => prev.map(student => 
          student.id === data.studentId 
            ? { ...student, examStarted: true, startTime: data.startTime }
            : student
        ));
        addActivity(`Học sinh ${data.studentName} đã bắt đầu làm bài`, 'success');
      }
    });

    // Lắng nghe sự kiện học sinh nộp câu trả lời
    socketClient.on('answerSubmitted', (data) => {
      console.log('Answer submitted:', data);
      if (data.examId === examId) {
        addActivity(`Học sinh ${data.studentName} đã nộp câu trả lời cho câu ${data.questionId}`, 'info');
      }
    });

    // Lắng nghe sự kiện học sinh hoàn thành bài thi
    socketClient.on('examCompleted', (data) => {
      console.log('Exam completed:', data);
      if (data.examId === examId) {
        setStudents(prev => prev.map(student => 
          student.id === data.studentId 
            ? { 
                ...student, 
                examCompleted: true, 
                score: data.score,
                totalQuestions: data.totalQuestions,
                timeTaken: data.timeTaken
              }
            : student
        ));
        addActivity(`Học sinh ${data.studentName} đã hoàn thành bài thi với ${data.score}/${data.totalQuestions} điểm`, 'success');
      }
    });

    // Lắng nghe sự kiện hoạt động đáng ngờ
    socketClient.on('suspiciousActivity', (data) => {
      console.log('Suspicious activity:', data);
      if (data.examId === examId) {
        addActivity(`Hoạt động đáng ngờ từ ${data.studentName}: ${data.activity}`, 'error');
      }
    });

    // Lắng nghe sự kiện cập nhật thống kê bài thi
    socketClient.on('examStats', (data) => {
      console.log('Exam stats:', data);
      if (data.examId === examId) {
        setExamStats(data);
      }
    });

    // Lắng nghe sự kiện cập nhật trạng thái bài thi
    socketClient.on('examStatus', (data) => {
      console.log('Exam status:', data);
      if (data.examId === examId) {
        setExamStats(data);
      }
    });

    // Test event để kiểm tra kết nối
    socketClient.on('test', (data) => {
      console.log('Test event received:', data);
    });
  };

  /**
   * Bắt đầu giám sát bài thi
   */
  const startMonitoring = () => {
    console.log('Starting monitoring for exam:', examId);
    socketClient.joinExam(examId);
    socketClient.startMonitoring(examId);
    setIsMonitoring(true);
    addActivity('Bắt đầu giám sát bài thi', 'success');
  };

  /**
   * Dừng giám sát bài thi
   */
  const stopMonitoring = () => {
    console.log('Stopping monitoring for exam:', examId);
    socketClient.leaveExam(examId);
    setIsMonitoring(false);
    addActivity('Dừng giám sát bài thi', 'warning');
  };

  /**
   * Thêm hoạt động vào danh sách với unique ID
   * @param {string} message - Nội dung hoạt động
   * @param {string} type - Loại hoạt động (success, warning, error, info)
   */
  const addActivity = (message, type = 'info') => {
    // Tạo unique ID bằng cách kết hợp timestamp và counter
    activityCounterRef.current += 1;
    const uniqueId = `${Date.now()}-${activityCounterRef.current}`;
    
    const activity = {
      id: uniqueId,
      message,
      type,
      timestamp: new Date()
    };
    setActivities(prev => [activity, ...prev.slice(0, 49)]); // Giữ tối đa 50 hoạt động
  };

  /**
   * Lấy icon cho loại hoạt động
   * @param {string} type - Loại hoạt động
   * @returns {string} Emoji icon
   */
  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  /**
   * Lấy màu sắc CSS cho loại hoạt động
   * @param {string} type - Loại hoạt động
   * @returns {string} CSS classes cho màu sắc
   */
  const getActivityColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  /**
   * Test kết nối Socket.IO
   */
  const testSocketConnection = () => {
    console.log('Testing socket connection...');
    const socket = socketClient.getSocket();
    if (socket) {
      socket.emit('test', { message: 'Hello from monitor!' });
      console.log('Test event sent');
    } else {
      console.log('No socket available');
    }
  };

  /**
   * Debug thông tin session hiện tại
   */
  const debugSession = () => {
    const sessionInfo = getCurrentSessionInfo();
    console.log('Current session info:', sessionInfo);
    alert(`Session Info:\nCurrent Token: ${sessionInfo.currentToken ? 'Exists' : 'Missing'}\nUser: ${sessionInfo.currentSession?.user?.name || 'Unknown'}`);
  };

  /**
   * Xóa tất cả session và reload trang
   */
  const clearSessions = () => {
    if (confirm('Clear all sessions? You will need to login again.')) {
      clearAllSessions();
      window.location.reload();
    }
  };

  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin bài thi...</p>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lỗi</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ==================== HEADER ==================== */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Giám sát bài thi</h1>
              <p className="text-gray-600 mt-2">{exam?.title}</p>
              <p className="text-sm text-gray-500">Exam ID: {examId}</p>
              <p className="text-sm text-gray-500">Socket Status: <span className={`font-semibold ${socketStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>{socketStatus}</span></p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Thống kê học sinh đang thi */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{examStats.activeStudents}</div>
                <div className="text-sm text-gray-500">Học sinh đang thi</div>
              </div>
              
              {/* Các nút debug và điều khiển */}
              <button
                onClick={debugSession}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Debug Session
              </button>
              <button
                onClick={clearSessions}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Clear Sessions
              </button>
              <button
                onClick={testSocketConnection}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Test Socket
              </button>
              <button
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isMonitoring
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isMonitoring ? 'Dừng giám sát' : 'Bắt đầu giám sát'}
              </button>
            </div>
          </div>
        </div>

        {/* ==================== MAIN CONTENT ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ==================== STUDENT LIST ==================== */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Danh sách học sinh</h2>
              <p className="text-gray-600 mt-1">{students.length} học sinh</p>
            </div>
            <div className="p-6">
              {/* Hiển thị khi chưa có học sinh */}
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">👥</div>
                  <p className="text-gray-500">Chưa có học sinh nào tham gia</p>
                  <p className="text-sm text-gray-400 mt-2">Kiểm tra console để debug</p>
                </div>
              ) : (
                /* Danh sách học sinh với trạng thái */
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">
                            Tham gia: {new Date(student.joinedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {student.examCompleted ? (
                          <div className="text-green-600 font-semibold">
                            {student.score}/{student.totalQuestions}
                          </div>
                        ) : student.examStarted ? (
                          <div className="text-blue-600 font-semibold">Đang làm bài</div>
                        ) : (
                          <div className="text-gray-500">Chờ bắt đầu</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ==================== REAL-TIME ACTIVITIES ==================== */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Hoạt động real-time</h2>
              <p className="text-gray-600 mt-1">Cập nhật theo thời gian thực</p>
            </div>
            <div className="p-6">
              {/* Hiển thị khi chưa có hoạt động */}
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📊</div>
                  <p className="text-gray-500">Chưa có hoạt động nào</p>
                </div>
              ) : (
                /* Danh sách hoạt động với scroll */
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-3 rounded-lg border-l-4 ${getActivityColor(activity.type)}`}
                    >
                      <div className="flex items-start space-x-2">
                        <span className="text-lg">{getActivityIcon(activity.type)}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================== DETAILED STATISTICS ==================== */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thống kê chi tiết</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Học sinh đang thi */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{examStats.activeStudents}</div>
              <div className="text-sm text-gray-600">Học sinh đang thi</div>
            </div>
            
            {/* Đã hoàn thành */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {students.filter(s => s.examCompleted).length}
              </div>
              <div className="text-sm text-gray-600">Đã hoàn thành</div>
            </div>
            
            {/* Đang làm bài */}
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">
                {students.filter(s => s.examStarted && !s.examCompleted).length}
              </div>
              <div className="text-sm text-gray-600">Đang làm bài</div>
            </div>
            
            {/* Chờ bắt đầu */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {students.filter(s => !s.examStarted).length}
              </div>
              <div className="text-sm text-gray-600">Chờ bắt đầu</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitor; 