// Import các thư viện React và React Router
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import các components chung
import Header from './components/Header';
import Footer from './components/Footer';
import SessionSwitcher from './components/SessionSwitcher';
import RealTimeNotification from './components/common/RealTimeNotification';

// Import các pages Landing và Auth
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Import các pages cho Student
import StudentDashboard from './pages/student/Dashboard';
import StudentExams from './pages/student/Exams';
import ExamStart from './pages/student/ExamStart';
import ExamResult from './pages/student/ExamResult';
import StudentResults from './pages/student/StudentResults';
import ExamDetailResult from './pages/student/ExamDetailResult';
import Profile from './pages/student/Profile';

// Import các pages cho Teacher
import TeacherDashboard from './pages/teacher/Dashboard';
import Exams from './pages/teacher/Exams';
import CreateExam from './pages/teacher/CreateExam';
import EditExam from './pages/teacher/EditExam';
import Monitor from './pages/teacher/Monitor';
import TeacherProfile from './pages/teacher/Profile';
import ExamResults from './pages/teacher/ExamResults';
import ExamDetailResults from './pages/teacher/ExamDetailResults';
import Students from './pages/teacher/Students';

// Import các pages cho Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminProfile from './pages/admin/Profile';
import AdminUsers from './pages/admin/Users';
import AdminExams from './pages/admin/Exams';
import AdminSettings from './pages/admin/Settings';
import AdminReports from './pages/admin/Reports';

// Import các utilities
import sessionManager from './utils/sessionManager';
import socketClient from './utils/socket.js';

/**
 * Component chuyển hướng dashboard theo vai trò của user
 * Tự động redirect user đến dashboard phù hợp với role
 */
const DashboardRedirect = ({ user }) => {
  if (!user) return <Navigate to="/" />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" />;
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  return <Navigate to="/" />;
};

/**
 * Layout component chung với Header và Footer
 * Sử dụng cho tất cả các trang có đăng nhập
 */
const Layout = ({ children, user, onLogout, onSessionChange }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} onLogout={onLogout} onSessionChange={onSessionChange} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

/**
 * Component chính của ứng dụng
 * Quản lý routing và state toàn cục
 */
function App() {
  // Lấy user từ SessionManager khi khởi tạo
  const [user, setUser] = useState(() => {
    return sessionManager.getCurrentUser();
  });

  // Lắng nghe sự thay đổi session mỗi giây
  useEffect(() => {
    const interval = setInterval(() => {
      const currentUser = sessionManager.getCurrentUser();
      if (currentUser !== user) {
        setUser(currentUser);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  // Quản lý Socket.IO connection
  useEffect(() => {
    if (user) {
      // Kết nối Socket.IO khi user đăng nhập
      const socket = socketClient.connect();
      
      if (socket) {
        console.log('Socket.IO connected for user:', user.name);
      }
    } else {
      // Ngắt kết nối Socket.IO khi user đăng xuất
      socketClient.disconnect();
    }

    return () => {
      // Cleanup khi component unmount
      socketClient.disconnect();
    };
  }, [user]);

  /**
   * Hàm xử lý đăng nhập thành công
   * @param {Object} user - Thông tin user
   * @param {String} token - JWT token
   */
  const handleLogin = (user, token) => {
    if (user && typeof user === 'object' && token) {
      sessionManager.createSession(user, token);
      setUser(user);
    } else {
      console.error('Invalid user data or token:', { user, token });
    }
  };

  /**
   * Hàm xử lý đăng xuất
   */
  const handleLogout = () => {
    sessionManager.logout();
    setUser(null);
  };

  /**
   * Hàm xử lý chuyển đổi session
   * @param {Object} newUser - Thông tin user mới
   */
  const handleSessionChange = (newUser) => {
    setUser(newUser);
  };

  /**
   * Component bảo vệ route - chỉ cho phép user đã đăng nhập và có role phù hợp
   * @param {React.ReactNode} children - Component con
   * @param {String} role - Role được phép truy cập
   */
  const ProtectedRoute = ({ children, role }) => {
    if (!user) return <Navigate to="/" />;
    if (role && user.role !== role) return <Navigate to="/" />;
    return children;
  };

  return (
    <Router>
      {/* Component hiển thị thông báo real-time */}
      {user && <RealTimeNotification />}
      
      <Routes>
        {/* Landing page - không có layout */}
        <Route path="/" element={user ? <DashboardRedirect user={user} /> : <Landing />} />
        
        {/* Auth routes - không có layout */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        
        {/* Dashboard redirect */}
        <Route path="/dashboard" element={<DashboardRedirect user={user} />} />
        
        {/* Protected routes cho Student */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute role="student">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
              <StudentDashboard user={user} />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Protected routes cho Teacher */}
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute role="teacher">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
              <TeacherDashboard user={user} />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Protected routes cho Admin */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="admin">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
              <AdminDashboard user={user} />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Routes quản lý bài thi cho Teacher */}
        <Route path="/teacher/exams" element={
          <ProtectedRoute role="teacher">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
            <Exams />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/teacher/create-exam" element={
          <ProtectedRoute role="teacher">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
            <CreateExam />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/teacher/exams/:id/edit" element={
          <ProtectedRoute role="teacher">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
            <EditExam />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/teacher/exams/:examId/monitor" element={
          <ProtectedRoute role="teacher">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
            <Monitor />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Routes cho Student làm bài thi */}
        <Route path="/student/exams" element={
          <ProtectedRoute role="student">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
            <StudentExams />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/student/exams/:id/start" element={
          <ProtectedRoute role="student">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
            <ExamStart />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/student/exams/:id/result" element={
          <ProtectedRoute role="student">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
            <ExamResult />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Student Results Routes */}
        <Route path="/student/results" element={
          <ProtectedRoute role="student">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
              <StudentResults />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/student/profile" element={
          <ProtectedRoute role="student">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/student/exams/:id/detail-result" element={
          <ProtectedRoute role="student">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
              <ExamDetailResult />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Teacher Results Routes */}
        <Route path="/teacher/results" element={
          <ProtectedRoute role="teacher">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
              <ExamResults />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/teacher/exams/:examId/results" element={
          <ProtectedRoute role="teacher">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
              <ExamDetailResults />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/teacher/students" element={
          <ProtectedRoute role="teacher">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
              <Students />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Teacher Profile Route */}
        <Route path="/teacher/profile" element={
          <ProtectedRoute role="teacher">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
              <TeacherProfile />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Admin Profile Route */}
        <Route path="/admin/profile" element={
          <ProtectedRoute role="admin">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
              <AdminProfile />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Admin Users Route */}
        <Route path="/admin/users" element={
          <ProtectedRoute role="admin">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
              <AdminUsers />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Admin Exams Route */}
        <Route path="/admin/exams" element={
          <ProtectedRoute role="admin">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
              <AdminExams />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Admin Settings Route */}
        <Route path="/admin/settings" element={
          <ProtectedRoute role="admin">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
              <AdminSettings />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Admin Reports Route */}
        <Route path="/admin/reports" element={
          <ProtectedRoute role="admin">
            <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
              <AdminReports />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
