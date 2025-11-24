/**
 * Component Monitor - Trang giám sát real-time cho giáo viên
 * Theo dõi hoạt động của học sinh trong thời gian thực khi làm bài thi
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import socketClient from '../../utils/socket.js';
import { getAuthHeaders, getApiUrl } from '../../utils/api.js';

const Monitor = () => {
  const { examId } = useParams();
  
  // ==================== STATE ====================
  const [exam, setExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  
  // ==================== REFS ====================
  // Map để track students - key là studentId, value là student object
  const studentsMapRef = useRef(new Map());
  // Set để track activity IDs đã thêm (tránh duplicate)
  const activityIdsRef = useRef(new Set());
  // Counter cho activity ID
  const activityCounterRef = useRef(0);
  // Flag để biết đã setup socket chưa
  const socketInitializedRef = useRef(false);
  // Lưu các event handlers để cleanup
  const handlersRef = useRef({});
  // Flag để tránh fetch nhiều lần
  const isFetchingRef = useRef(false);
  // Ref để track isMonitoring trong event handlers
  const isMonitoringRef = useRef(false);
  // Ref để track examId trong event handlers (luôn có giá trị mới nhất)
  const examIdRef = useRef(examId);

  // ==================== FUNCTIONS ====================
  
  /**
   * Cleanup socket listeners
   */
  const cleanupSocket = () => {
    console.log('[SOCKET] Cleaning up...');
    
    if (isMonitoringRef.current && examIdRef.current) {
      socketClient.leaveExam(examIdRef.current);
    }

    // Remove all listeners
    Object.keys(handlersRef.current).forEach(event => {
      if (handlersRef.current[event]) {
        socketClient.off(event, handlersRef.current[event]);
      }
    });
    
    handlersRef.current = {};
  };

  /**
   * Initialize socket connection và setup event listeners
   */
  const initializeSocket = () => {
    console.log('[SOCKET] 🔄 Initializing socket connection...');
    
    // Remove old listeners trước khi setup mới
    if (handlersRef.current) {
      Object.keys(handlersRef.current).forEach(event => {
        if (handlersRef.current[event]) {
          socketClient.off(event, handlersRef.current[event]);
        }
      });
      handlersRef.current = {};
    }
    
    // Connect socket
    const socket = socketClient.connect();
    if (!socket) {
      setError('Không thể kết nối Socket.IO');
      console.error('[SOCKET] ❌ Socket connection failed');
      return;
    }

    // Check connection status và setup connection handler
    if (socket.connected) {
      console.log('[SOCKET] ✅ Socket already connected');
      setSocketStatus('connected');
    } else {
      console.log('[SOCKET] ⏳ Socket connecting...');
      setSocketStatus('connecting');
      
      // Lắng nghe khi socket connect
      const onConnect = () => {
        console.log('[SOCKET] ✅ Socket connected successfully');
        setSocketStatus('connected');
      };
      socket.once('connect', onConnect);
    }

    // ==================== SOCKET EVENT HANDLERS ====================

    // Connection events
    const handleConnect = () => {
      console.log('[SOCKET] ✅ Connected');
      setSocketStatus('connected');
    };

    const handleDisconnect = () => {
      console.log('[SOCKET] ❌ Disconnected');
      setSocketStatus('disconnected');
    };

    // User joined exam - LUÔN hiển thị activity, chỉ update list nếu đang monitoring
    const handleUserJoined = (data) => {
      console.log('[SOCKET] 📥 userJoinedExam event received:', data);
      
      // Sử dụng examIdRef để luôn có giá trị mới nhất
      if (!data || data.examId !== examIdRef.current) {
        console.log(`[SOCKET] ⚠️ Ignoring event - wrong examId. Expected: ${examIdRef.current}, Got: ${data?.examId}`);
        return;
      }
      
      if (data.userRole !== 'student') {
        console.log('[SOCKET] ⚠️ Ignoring event - not a student, role:', data.userRole);
        return;
      }
      
      // LUÔN thêm activity (ngay cả khi chưa monitoring)
      console.log(`[SOCKET] ✅ Adding activity for student join: ${data.userName}`);
      setActivities(prev => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const activity = {
          id,
          message: `Học sinh ${data.userName || 'một học sinh'} đã tham gia bài thi`,
          type: 'info',
          timestamp: new Date()
        };
        return [activity, ...prev].slice(0, 100);
      });
      
      // Chỉ update students list nếu đang monitoring
      if (isMonitoringRef.current && !isFetchingRef.current) {
        console.log(`[SOCKET] ✅ Adding student to list: ${data.userId} (${data.userName})`);
        const studentId = data.userId;
        const existing = studentsMapRef.current.get(studentId);
        
        if (existing) {
          const updated = { ...existing };
          studentsMapRef.current.set(studentId, updated);
        } else {
          const newStudent = {
            id: studentId,
            name: data.userName || 'Học sinh',
            email: data.email || '',
            studentId: data.studentId || '',
            joinedAt: data.timestamp || new Date(),
            examStarted: false,
            examCompleted: false,
            startTime: null,
            score: null,
            totalQuestions: null,
            status: 'active'
          };
          studentsMapRef.current.set(studentId, newStudent);
        }
        
        setStudents(Array.from(studentsMapRef.current.values()));
      } else {
        console.log(`[SOCKET] ⚠️ Not monitoring (${isMonitoringRef.current}) or fetching (${isFetchingRef.current}), skipping student list update`);
      }
    };

    // User left exam - LUÔN hiển thị activity, chỉ update list nếu đang monitoring
    const handleUserLeft = (data) => {
      console.log('[SOCKET] 📥 userLeftExam event received:', data);
      
      if (!data || data.examId !== examIdRef.current) {
        console.log(`[SOCKET] ⚠️ Ignoring event - wrong examId. Expected: ${examIdRef.current}, Got: ${data?.examId}`);
        return;
      }
      
      if (data.userRole !== 'student') {
        return;
      }
      
      // LUÔN thêm activity
      console.log(`[SOCKET] ✅ Adding activity for student leave: ${data.userName}`);
      setActivities(prev => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const activity = {
          id,
          message: `Học sinh ${data.userName || 'một học sinh'} đã rời bài thi`,
          type: 'warning',
          timestamp: new Date()
        };
        return [activity, ...prev].slice(0, 100);
      });
      
      // Chỉ update students list nếu đang monitoring
      if (isMonitoringRef.current) {
        console.log(`[SOCKET] ✅ Removing student from list: ${data.userId}`);
        if (studentsMapRef.current.has(data.userId)) {
          studentsMapRef.current.delete(data.userId);
          setStudents(Array.from(studentsMapRef.current.values()));
        }
      }
    };

    // Exam started - LUÔN hiển thị activity
    const handleExamStarted = (data) => {
      console.log('[SOCKET] 📥 examStarted event received:', data);
      
      if (!data || data.examId !== examIdRef.current) {
        console.log(`[SOCKET] ⚠️ Ignoring event - wrong examId. Expected: ${examIdRef.current}, Got: ${data?.examId}`);
        return;
      }
      
      // LUÔN thêm activity
      console.log(`[SOCKET] ✅ Adding activity for exam started: ${data.studentName}`);
      setActivities(prev => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const activity = {
          id,
          message: `Học sinh ${data.studentName || 'một học sinh'} đã bắt đầu làm bài`,
          type: 'success',
          timestamp: new Date()
        };
        return [activity, ...prev].slice(0, 100);
      });
      
      // Chỉ update students list nếu đang monitoring
      if (isMonitoringRef.current) {
        console.log(`[SOCKET] ✅ Updating student examStarted: ${data.studentId}`);
        const studentId = data.studentId;
        const existing = studentsMapRef.current.get(studentId);
        if (existing) {
          const updated = { ...existing, examStarted: true, startTime: data.startTime };
          studentsMapRef.current.set(studentId, updated);
          setStudents(Array.from(studentsMapRef.current.values()));
        }
      }
    };

    // Exam completed - LUÔN hiển thị activity
    const handleExamCompleted = (data) => {
      console.log('[SOCKET] 📥 examCompleted event received:', data);
      
      if (!data || data.examId !== examIdRef.current) {
        console.log(`[SOCKET] ⚠️ Ignoring event - wrong examId. Expected: ${examIdRef.current}, Got: ${data?.examId}`);
        return;
      }
      
      // LUÔN thêm activity
      console.log(`[SOCKET] ✅ Adding activity for exam completed: ${data.studentName}`);
      // Tính số câu đúng từ điểm phần trăm
      const correctAnswers = data.totalQuestions && data.score !== undefined 
        ? Math.round((data.score * data.totalQuestions) / 100) 
        : 0;
      setActivities(prev => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const activity = {
          id,
          message: `Học sinh ${data.studentName || 'một học sinh'} đã hoàn thành bài thi với ${correctAnswers}/${data.totalQuestions} câu đúng`,
          type: 'success',
          timestamp: new Date()
        };
        return [activity, ...prev].slice(0, 100);
      });
      
      // Chỉ update students list nếu đang monitoring
      if (isMonitoringRef.current) {
        console.log(`[SOCKET] ✅ Updating student examCompleted: ${data.studentId}`);
        const studentId = data.studentId;
        const existing = studentsMapRef.current.get(studentId);
        if (existing) {
          const updated = {
            ...existing,
            examCompleted: true,
            score: data.score,
            totalQuestions: data.totalQuestions,
            timeTaken: data.timeTaken,
            status: 'completed'
          };
          studentsMapRef.current.set(studentId, updated);
          setStudents(Array.from(studentsMapRef.current.values()));
        }
      }
    };

    // Suspicious activity - LUÔN hiển thị activity
    const handleSuspiciousActivity = (data) => {
      console.log('[SOCKET] 📥 suspiciousActivity event received:', data);
      
      if (!data || data.examId !== examIdRef.current) {
        console.log(`[SOCKET] ⚠️ Ignoring event - wrong examId. Expected: ${examIdRef.current}, Got: ${data?.examId}`);
        return;
      }
      
      // LUÔN thêm activity
      console.log(`[SOCKET] ✅ Adding activity for suspicious activity: ${data.studentName}`);
      setActivities(prev => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const activity = {
          id,
          message: `Hoạt động đáng ngờ từ ${data.studentName || 'một học sinh'}: ${data.activity || 'Không xác định'}`,
          type: 'error',
          timestamp: new Date()
        };
        return [activity, ...prev].slice(0, 100);
      });
    };

    // Exam stats
    const handleExamStats = (data) => {
      if (data && data.examId === examIdRef.current) {
        console.log('[SOCKET] 📥 examStats event:', data);
        // Có thể cập nhật stats nếu cần
      }
    };

    // ==================== REGISTER EVENT LISTENERS ====================
    
    console.log('[SOCKET] Registering event listeners...');
    socketClient.on('connect', handleConnect);
    socketClient.on('disconnect', handleDisconnect);
    socketClient.on('userJoinedExam', handleUserJoined);
    socketClient.on('userLeftExam', handleUserLeft);
    socketClient.on('examStarted', handleExamStarted);
    socketClient.on('examCompleted', handleExamCompleted);
    socketClient.on('suspiciousActivity', handleSuspiciousActivity);
    socketClient.on('examStats', handleExamStats);

    // Lưu handlers để cleanup
    handlersRef.current = {
      connect: handleConnect,
      disconnect: handleDisconnect,
      userJoinedExam: handleUserJoined,
      userLeftExam: handleUserLeft,
      examStarted: handleExamStarted,
      examCompleted: handleExamCompleted,
      suspiciousActivity: handleSuspiciousActivity,
      examStats: handleExamStats
    };
    
    console.log('[SOCKET] ✅ Socket initialized and event listeners registered');
  };

  // ==================== EFFECTS ====================
  
  // Fetch exam details khi component mount
  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  // Sync refs với state
  useEffect(() => {
    isMonitoringRef.current = isMonitoring;
    examIdRef.current = examId;
  }, [isMonitoring, examId]);

  // Setup socket connection - re-initialize khi examId thay đổi
  useEffect(() => {
    console.log('[MONITOR] Setting up socket for examId:', examId);
    
    // Cleanup trước
    if (socketInitializedRef.current) {
      cleanupSocket();
      socketInitializedRef.current = false;
    }
    
    // Initialize socket
    initializeSocket();
    socketInitializedRef.current = true;

    return () => {
      console.log('[MONITOR] Cleanup socket on unmount or examId change');
      cleanupSocket();
      socketInitializedRef.current = false;
    };
  }, [examId]);

  /**
   * Fetch thông tin đề thi
   */
  const fetchExamDetails = async () => {
    try {
      const response = await fetch(getApiUrl(`exams/${examId}`), {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch exam');
      
      const data = await response.json();
      setExam(data.data || data);
    } catch (err) {
      setError('Không thể tải thông tin đề thi');
      console.error('Error fetching exam:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch danh sách học sinh đang thi từ database
   */
  const fetchActiveStudents = async () => {
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      
      const response = await fetch(getApiUrl(`results/exam/${examId}/active`), {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        console.error('[FETCH] Failed to fetch active students');
        return;
      }
      
      const data = await response.json();
      
      if (data.data?.students) {
        const studentsList = data.data.students
          .filter(s => s.status === 'in_progress' && !s.examCompleted)
          .map(s => ({
            id: s.id,
            name: s.name || 'Học sinh',
            email: s.email || '',
            studentId: s.studentId || '',
            joinedAt: s.startTime,
            examStarted: s.examStarted || true,
            examCompleted: false,
            startTime: s.startTime,
            score: s.score || null,
            totalQuestions: s.totalQuestions || null,
            status: 'active'
          }));

        // Clear và rebuild Map
        studentsMapRef.current.clear();
        studentsList.forEach(student => {
          studentsMapRef.current.set(student.id, student);
        });

        // Update state
        setStudents(Array.from(studentsMapRef.current.values()));
      } else {
        studentsMapRef.current.clear();
        setStudents([]);
      }
    } catch (err) {
      console.error('[FETCH] Error:', err);
      studentsMapRef.current.clear();
      setStudents([]);
    } finally {
      isFetchingRef.current = false;
    }
  };

  /**
   * Thêm activity vào danh sách (tránh duplicate)
   */
  const addActivity = useCallback((message, type = 'info') => {
    if (!message) return;

    activityCounterRef.current += 1;
    const id = `${Date.now()}-${activityCounterRef.current}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Kiểm tra duplicate
    if (activityIdsRef.current.has(id)) {
      console.log('[ACTIVITY] Duplicate detected, skipping');
      return;
    }

    activityIdsRef.current.add(id);
    
    const activity = {
      id,
      message,
      type,
      timestamp: new Date()
    };

    setActivities(prev => {
      // Giữ tối đa 100 activities
      const newList = [activity, ...prev].slice(0, 100);
      return newList;
    });
  }, []);

  /**
   * Thêm hoặc cập nhật student trong Map và state
   */
  const upsertStudent = useCallback((studentData) => {
    const studentId = studentData.id || studentData.userId;
    if (!studentId) return;

    const existing = studentsMapRef.current.get(studentId);
    
    if (existing) {
      // Update existing
      const updated = { ...existing, ...studentData };
      studentsMapRef.current.set(studentId, updated);
    } else {
      // Add new
      const newStudent = {
        id: studentId,
        name: studentData.userName || studentData.name || 'Học sinh',
        email: studentData.email || '',
        studentId: studentData.studentId || '',
        joinedAt: studentData.timestamp || studentData.joinedAt || new Date(),
        examStarted: studentData.examStarted || false,
        examCompleted: studentData.examCompleted || false,
        startTime: studentData.startTime || null,
        score: studentData.score || null,
        totalQuestions: studentData.totalQuestions || null,
        status: studentData.status || 'active'
      };
      studentsMapRef.current.set(studentId, newStudent);
    }

    // Update state từ Map
    setStudents(Array.from(studentsMapRef.current.values()));
  }, []);

  /**
   * Xóa student khỏi Map và state
   */
  const removeStudent = useCallback((studentId) => {
    if (studentsMapRef.current.has(studentId)) {
      studentsMapRef.current.delete(studentId);
      setStudents(Array.from(studentsMapRef.current.values()));
    }
  }, []);


  /**
   * Bắt đầu giám sát
   */
  const startMonitoring = async () => {
    console.log('[MONITOR] 🚀 Starting monitoring for exam:', examId);
    
    // Đảm bảo socket đã được initialize
    if (!socketInitializedRef.current) {
      console.log('[MONITOR] Socket not initialized, initializing now...');
      initializeSocket();
      socketInitializedRef.current = true;
      // Đợi một chút để socket có thời gian connect
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Đảm bảo socket đã connected - đợi nếu cần
    const socket = socketClient.getSocket();
    if (!socket) {
      console.error('[MONITOR] ❌ Socket is null');
      setError('Socket chưa được khởi tạo. Vui lòng refresh trang và thử lại.');
      return;
    }
    
    // Đợi socket connected nếu chưa
    if (!socket.connected) {
      console.log('[MONITOR] ⏳ Socket not connected, waiting for connection...');
      setSocketStatus('connecting');
      
      // Đợi tối đa 5 giây
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout waiting for socket connection'));
        }, 5000);
        
        socket.once('connect', () => {
          clearTimeout(timeout);
          console.log('[MONITOR] ✅ Socket connected, proceeding...');
          setSocketStatus('connected');
          resolve();
        });
      }).catch(() => {
        setError('Không thể kết nối Socket.IO. Vui lòng kiểm tra kết nối mạng.');
        return;
      });
    }
    
    // Clear previous data
    studentsMapRef.current.clear();
    setStudents([]);
    
    // Fetch active students from database
    console.log('[MONITOR] 📥 Fetching active students from database...');
    await fetchActiveStudents();
    
    // Wait a bit for state to update
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Join exam room TRƯỚC khi set monitoring = true
    console.log('[MONITOR] 🚪 Joining exam room:', examId);
    socketClient.joinExam(examId);
    
    // Đợi một chút để đảm bảo join thành công
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Start monitoring
    console.log('[MONITOR] 👁️ Starting monitoring...');
    socketClient.startMonitoring(examId);
    
    // Set monitoring = true SAU khi đã join room
    setIsMonitoring(true);
    addActivity('Bắt đầu giám sát bài thi', 'success');
    
    console.log('[MONITOR] ✅ Monitoring started successfully');
  };

  /**
   * Dừng giám sát
   */
  const stopMonitoring = () => {
    console.log('[MONITOR] Stopping...');
    
    socketClient.leaveExam(examId);
    setIsMonitoring(false);
    
    // Clear data
    studentsMapRef.current.clear();
    setStudents([]);
    
    addActivity('Dừng giám sát bài thi', 'warning');
  };

  // ==================== HELPER FUNCTIONS ====================

  const getActivityIcon = (type) => {
    const icons = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  };

  const getActivityColor = (type) => {
    const colors = {
      success: 'text-green-600 bg-green-50 border-green-200',
      warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      error: 'text-red-600 bg-red-50 border-red-200',
      info: 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[type] || colors.info;
  };

  // ==================== RENDER ====================

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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Giám sát bài thi</h1>
              <p className="text-gray-600 mt-2 font-medium">
                {exam?.data?.exam?.title || exam?.title || 'Đang tải...'}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Trạng thái kết nối:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    socketStatus === 'connected' 
                      ? 'bg-green-100 text-green-800' 
                      : socketStatus === 'connecting'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${
                      socketStatus === 'connected' 
                        ? 'bg-green-500' 
                        : socketStatus === 'connecting'
                        ? 'bg-yellow-500 animate-pulse'
                        : 'bg-red-500'
                    }`}></span>
                    {socketStatus === 'connected' ? 'Đã kết nối' : socketStatus === 'connecting' ? 'Đang kết nối...' : 'Mất kết nối'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                <div className="text-xs text-gray-600">Học sinh</div>
              </div>
              <button
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors shadow-md ${
                  isMonitoring
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isMonitoring ? (
                  <>
                    <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                    Dừng giám sát
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Bắt đầu giám sát
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Danh sách học sinh</h2>
              <p className="text-gray-600 mt-1 text-sm">{students.length} học sinh</p>
            </div>
            <div className="p-6">
              {students.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">👥</div>
                  <p className="text-gray-600 font-medium">Chưa có học sinh nào tham gia</p>
                  <p className="text-sm text-gray-400 mt-2">Danh sách sẽ được cập nhật khi học sinh tham gia</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {students.map((student) => (
                    <div 
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          student.examCompleted 
                            ? 'bg-green-100' 
                            : student.examStarted 
                            ? 'bg-blue-100' 
                            : 'bg-gray-200'
                        }`}>
                          <span className={`font-semibold text-sm ${
                            student.examCompleted 
                              ? 'text-green-700' 
                              : student.examStarted 
                              ? 'text-blue-700' 
                              : 'text-gray-600'
                          }`}>
                            {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {student.name || 'Học sinh'}
                            {student.studentId && (
                              <span className="ml-2 text-xs text-gray-500 font-normal">
                                ({student.studentId})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.joinedAt 
                              ? `Tham gia: ${new Date(student.joinedAt).toLocaleTimeString('vi-VN')}`
                              : 'Đang tham gia'
                            }
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        {student.examCompleted ? (
                          <div className="flex flex-col items-end">
                            <span className="text-green-600 font-bold text-lg">
                              {student.score}/{student.totalQuestions}
                            </span>
                            <span className="text-xs text-green-600">Hoàn thành</span>
                          </div>
                        ) : student.examStarted ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <span className="w-2 h-2 bg-blue-600 rounded-full mr-1.5 animate-pulse"></span>
                            Đang làm bài
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Chờ bắt đầu
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activities */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Hoạt động real-time</h2>
                  <p className="text-gray-600 mt-1 text-sm">Cập nhật theo thời gian thực</p>
                </div>
                {activities.length > 0 && (
                  <button
                    onClick={() => {
                      setActivities([]);
                      activityIdsRef.current.clear();
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📊</div>
                  <p className="text-gray-500">Chưa có hoạt động nào</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-3 rounded-lg border-l-4 ${getActivityColor(activity.type)} transition-all hover:shadow-sm`}
                    >
                      <div className="flex items-start space-x-2">
                        <span className="text-lg flex-shrink-0">{getActivityIcon(activity.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium break-words">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.timestamp).toLocaleTimeString('vi-VN')}
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

        {/* Statistics */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thống kê chi tiết</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{students.length}</div>
              <div className="text-sm text-gray-600">Học sinh đang thi</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {students.filter(s => s.examCompleted).length}
              </div>
              <div className="text-sm text-gray-600">Đã hoàn thành</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">
                {students.filter(s => s.examStarted && !s.examCompleted).length}
              </div>
              <div className="text-sm text-gray-600">Đang làm bài</div>
            </div>
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

