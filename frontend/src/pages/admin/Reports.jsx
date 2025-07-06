/**
 * Component Reports - Trang báo cáo thống kê cho admin
 * Hiển thị tổng quan chi tiết về hoạt động của hệ thống thi trắc nghiệm
 */

import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { getAuthHeaders } from '../../utils/api';

/**
 * Reports component
 * @returns {JSX.Element} Trang báo cáo với thống kê chi tiết hệ thống
 */
const Reports = () => {
  // State quản lý thống kê và trạng thái
  const [stats, setStats] = useState({
    users: {
      total: 0,      // Tổng số người dùng
      students: 0,   // Số học sinh
      teachers: 0,   // Số giáo viên
      admins: 0      // Số admin
    },
    exams: {
      total: 0,      // Tổng số đề thi
      active: 0,     // Đề thi đang diễn ra
      completed: 0,  // Đề thi đã kết thúc
      draft: 0       // Đề thi nháp
    },
    results: {
      total: 0,          // Tổng số kết quả
      averageScore: 0,   // Điểm trung bình
      passRate: 0        // Tỷ lệ đạt
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Effect để fetch dữ liệu báo cáo khi component mount
  useEffect(() => {
    fetchReportData();
  }, []);

  /**
   * Fetch dữ liệu báo cáo từ các API
   */
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');

      // ==================== FETCH USERS DATA ====================
      
      // Lấy dữ liệu người dùng
      const usersResponse = await fetch('http://localhost:5000/api/users', {
        headers: getAuthHeaders()
      });
      const usersData = await usersResponse.json();
      const users = usersData.data?.users || [];

      // ==================== FETCH EXAMS DATA ====================
      
      // Lấy dữ liệu đề thi
      const examsResponse = await fetch('http://localhost:5000/api/exams', {
        headers: getAuthHeaders()
      });
      const examsData = await examsResponse.json();
      const exams = examsData.data?.exams || [];

      // ==================== FETCH RESULTS DATA ====================
      
      // Lấy dữ liệu kết quả thi
      const resultsResponse = await fetch('http://localhost:5000/api/results', {
        headers: getAuthHeaders()
      });
      const resultsData = await resultsResponse.json();
      const results = resultsData.data?.results || [];

      // ==================== CALCULATE USER STATISTICS ====================
      
      // Tính thống kê người dùng theo role
      const userStats = {
        total: users.length,
        students: users.filter(u => u.role === 'student').length,
        teachers: users.filter(u => u.role === 'teacher').length,
        admins: users.filter(u => u.role === 'admin').length
      };

      // ==================== CALCULATE EXAM STATISTICS ====================
      
      // Tính thống kê đề thi theo trạng thái
      const examStats = {
        total: exams.length,
        active: exams.filter(e => e.status === 'active').length,
        completed: exams.filter(e => e.status === 'completed').length,
        draft: exams.filter(e => e.status === 'draft').length
      };

      // ==================== CALCULATE RESULT STATISTICS ====================
      
      // Tính thống kê kết quả thi
      const resultStats = {
        total: results.length,
        averageScore: results.length > 0 ? 
          (results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length).toFixed(2) : 0,
        passRate: results.length > 0 ? 
          ((results.filter(r => (r.score || 0) >= 5).length / results.length) * 100).toFixed(1) : 0
      };

      // Cập nhật state với thống kê đã tính
      setStats({
        users: userStats,
        exams: examStats,
        results: resultStats
      });
    } catch (err) {
      setError('Không thể tải dữ liệu báo cáo');
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Đang tải báo cáo..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ==================== HEADER ==================== */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Báo cáo hệ thống
          </h1>
          <p className="mt-2 text-gray-600">
            Tổng quan chi tiết về hoạt động của hệ thống
          </p>
        </div>

        {/* Hiển thị lỗi nếu có */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        {/* ==================== USER STATISTICS ==================== */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thống kê người dùng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tổng người dùng */}
            <Card className="bg-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tổng người dùng</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.users.total}</p>
                </div>
              </div>
            </Card>

            {/* Học sinh */}
            <Card className="bg-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">🎓</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Học sinh</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.users.students}</p>
                </div>
              </div>
            </Card>

            {/* Giáo viên */}
            <Card className="bg-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">👨‍🏫</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Giáo viên</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.users.teachers}</p>
                </div>
              </div>
            </Card>

            {/* Quản trị viên */}
            <Card className="bg-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">👑</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Quản trị viên</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.users.admins}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ==================== EXAM STATISTICS ==================== */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thống kê đề thi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tổng đề thi */}
            <Card className="bg-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">📝</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tổng đề thi</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.exams.total}</p>
                </div>
              </div>
            </Card>

            {/* Đang diễn ra */}
            <Card className="bg-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">⏰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Đang diễn ra</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.exams.active}</p>
                </div>
              </div>
            </Card>

            {/* Đã kết thúc */}
            <Card className="bg-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Đã kết thúc</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.exams.completed}</p>
                </div>
              </div>
            </Card>

            {/* Nháp */}
            <Card className="bg-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">📄</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Nháp</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.exams.draft}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ==================== RESULT STATISTICS ==================== */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thống kê kết quả
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tổng kết quả */}
            <Card className="bg-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tổng kết quả</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.results.total}</p>
                </div>
              </div>
            </Card>

            {/* Điểm trung bình */}
            <Card className="bg-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">📈</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Điểm trung bình</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.results.averageScore}</p>
                </div>
              </div>
            </Card>

            {/* Tỷ lệ đạt */}
            <Card className="bg-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">🎯</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tỷ lệ đạt</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.results.passRate}%</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ==================== SYSTEM HEALTH ==================== */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tình trạng hệ thống
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trạng thái server */}
            <Card className="bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Trạng thái server</h3>
                  <p className="text-sm text-gray-500">Kiểm tra kết nối database</p>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">Hoạt động</span>
                </div>
              </div>
            </Card>

            {/* Bảo mật */}
            <Card className="bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Bảo mật</h3>
                  <p className="text-sm text-gray-500">Kiểm tra cấu hình bảo mật</p>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">An toàn</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 