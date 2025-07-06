/**
 * Component StudentDashboard - Trang dashboard chính cho học sinh
 * Hiển thị tổng quan về hoạt động học tập, thống kê và các thao tác nhanh
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { getAuthHeaders } from '../../utils/api';
import { createApiUrl } from '../utils/api';

/**
 * StudentDashboard component
 * @param {Object} user - Thông tin người dùng hiện tại
 * @returns {JSX.Element} Trang dashboard với thống kê học tập và quick actions
 */
const StudentDashboard = ({ user }) => {
  // State quản lý thống kê và dữ liệu
  const [stats, setStats] = useState({
    completedExams: 0,    // Số bài thi đã hoàn thành
    averageScore: 0,      // Điểm trung bình
    upcomingExams: 0,     // Số bài thi sắp tới
    totalExams: 0         // Tổng số đề thi
  });

  const [recentExams, setRecentExams] = useState([]); // Danh sách bài thi gần đây
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Effect để fetch dữ liệu dashboard khi component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Fetch tất cả dữ liệu cần thiết cho dashboard
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // ==================== FETCH AVAILABLE EXAMS ====================
      
      // Lấy danh sách tất cả đề thi có sẵn
      const examsResponse = await fetch(createApiUrl('/api/exams'), {
        headers: getAuthHeaders()
      });
      
      const examsData = await examsResponse.json();
      
      if (!examsResponse.ok) {
        throw new Error(examsData.message || 'Không thể tải danh sách đề thi');
      }

      const exams = examsData.data.exams || [];
      
      // ==================== FETCH STUDENT RESULTS ====================
      
      // Lấy kết quả thi của học sinh
      const resultsResponse = await fetch(createApiUrl('/api/results'), {
        headers: getAuthHeaders()
      });
      
      const resultsData = await resultsResponse.json();
      const results = resultsResponse.ok ? (resultsData.data.results || []) : [];

      // ==================== CALCULATE STATISTICS ====================
      
      // Tính toán các thống kê
      const completedExams = results.length;
      const averageScore = completedExams > 0 
        ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / completedExams)
        : 0;
      
      const now = new Date();
      const upcomingExams = exams.filter(exam => 
        new Date(exam.startTime) > now && exam.status === 'scheduled'
      ).length;

      setStats({
        completedExams,
        averageScore,
        upcomingExams,
        totalExams: exams.length
      });

      // ==================== PREPARE RECENT EXAMS ====================
      
      // Chuẩn bị dữ liệu bài thi gần đây (5 bài thi đầu tiên đã hoàn thành)
      const recentExamsData = results.slice(0, 5).map(result => ({
        id: result._id,
        title: result.exam?.title || 'Bài thi không xác định',
        score: result.score,
        completedAt: new Date(result.createdAt).toLocaleDateString('vi-VN'),
        status: 'completed'
      }));

      // Thêm bài thi sắp tới nếu còn chỗ trống
      const upcomingExamsData = exams
        .filter(exam => new Date(exam.startTime) > now && exam.status === 'scheduled')
        .slice(0, 5 - recentExamsData.length)
        .map(exam => ({
          id: exam._id,
          title: exam.title,
          startTime: new Date(exam.startTime).toLocaleDateString('vi-VN'),
          status: 'upcoming'
        }));

      setRecentExams([...recentExamsData, ...upcomingExamsData]);

    } catch (err) {
      console.error('Fetch dashboard data error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lấy màu sắc CSS cho badge trạng thái bài thi
   * @param {string} status - Trạng thái bài thi
   * @returns {string} CSS classes cho màu sắc
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Chuyển đổi trạng thái bài thi sang tên hiển thị tiếng Việt
   * @param {string} status - Trạng thái bài thi
   * @returns {string} Tên hiển thị tiếng Việt
   */
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'upcoming':
        return 'Sắp tới';
      case 'in-progress':
        return 'Đang làm';
      default:
        return 'Không xác định';
    }
  };

  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Đang tải dữ liệu..." />
      </div>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ==================== HEADER ==================== */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Học sinh
          </h1>
          <p className="mt-2 text-gray-600">
            Chào mừng {user?.name}, đây là tổng quan học tập của bạn
          </p>
        </div>

        {/* ==================== STATISTICS GRID ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card bài thi đã hoàn thành */}
          <Card className="bg-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-lg">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Đã hoàn thành</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completedExams}</p>
              </div>
            </div>
          </Card>

          {/* Card điểm trung bình */}
          <Card className="bg-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-lg">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Điểm trung bình</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageScore}%</p>
              </div>
            </div>
          </Card>

          {/* Card bài thi sắp tới */}
          <Card className="bg-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-lg">⏰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sắp tới</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.upcomingExams}</p>
              </div>
            </div>
          </Card>

          {/* Card tổng số đề thi */}
          <Card className="bg-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-lg">📝</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng đề thi</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalExams}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* ==================== QUICK ACTIONS ==================== */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card làm bài thi */}
            <Link to="/student/exams" className="block group">
              <Card className="bg-white hover:shadow-lg transition-shadow duration-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-2xl text-white">📝</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Làm bài thi
                  </h3>
                  <p className="text-sm text-gray-600">
                    Xem danh sách đề thi có sẵn
                  </p>
                </div>
              </Card>
            </Link>

            {/* Card xem kết quả */}
            <Link to="/student/results" className="block group">
              <Card className="bg-white hover:shadow-lg transition-shadow duration-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-2xl text-white">📊</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Xem kết quả
                  </h3>
                  <p className="text-sm text-gray-600">
                    Xem kết quả các bài thi đã làm
                  </p>
                </div>
              </Card>
            </Link>

            {/* Card hồ sơ cá nhân */}
            <Link to="/student/profile" className="block group">
              <Card className="bg-white hover:shadow-lg transition-shadow duration-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-2xl text-white">👤</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Hồ sơ cá nhân
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cập nhật thông tin cá nhân
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* ==================== RECENT EXAMS ==================== */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Bài thi gần đây
          </h2>
          <Card className="bg-white">
            {/* Hiển thị khi chưa có bài thi */}
            {recentExams.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có bài thi nào</p>
              </div>
            ) : (
              /* Danh sách bài thi gần đây */
              <div className="space-y-4">
                {recentExams.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                    {/* Thông tin bài thi */}
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {exam.title}
                      </h3>
                      {/* Hiển thị điểm nếu đã hoàn thành */}
                      {exam.score && (
                        <p className="text-sm text-gray-600">
                          Điểm: {exam.score}/100
                        </p>
                      )}
                      {/* Hiển thị ngày hoàn thành */}
                      {exam.completedAt && (
                        <p className="text-xs text-gray-500">
                          Hoàn thành: {exam.completedAt}
                        </p>
                      )}
                      {/* Hiển thị ngày bắt đầu cho bài thi sắp tới */}
                      {exam.startTime && (
                        <p className="text-xs text-gray-500">
                          Bắt đầu: {exam.startTime}
                        </p>
                      )}
                    </div>
                    {/* Trạng thái bài thi */}
                    <div className="ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                        {getStatusText(exam.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 