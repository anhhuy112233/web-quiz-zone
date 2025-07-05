import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { getAuthHeaders } from '../../utils/api';

const Reports = () => {
  const [stats, setStats] = useState({
    users: {
      total: 0,
      students: 0,
      teachers: 0,
      admins: 0
    },
    exams: {
      total: 0,
      active: 0,
      completed: 0,
      draft: 0
    },
    results: {
      total: 0,
      averageScore: 0,
      passRate: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch users data
      const usersResponse = await fetch('http://localhost:5000/api/users', {
        headers: getAuthHeaders()
      });
      const usersData = await usersResponse.json();
      const users = usersData.data?.users || [];

      // Fetch exams data
      const examsResponse = await fetch('http://localhost:5000/api/exams', {
        headers: getAuthHeaders()
      });
      const examsData = await examsResponse.json();
      const exams = examsData.data?.exams || [];

      // Fetch results data
      const resultsResponse = await fetch('http://localhost:5000/api/results', {
        headers: getAuthHeaders()
      });
      const resultsData = await resultsResponse.json();
      const results = resultsData.data?.results || [];

      // Calculate user statistics
      const userStats = {
        total: users.length,
        students: users.filter(u => u.role === 'student').length,
        teachers: users.filter(u => u.role === 'teacher').length,
        admins: users.filter(u => u.role === 'admin').length
      };

      // Calculate exam statistics
      const examStats = {
        total: exams.length,
        active: exams.filter(e => e.status === 'active').length,
        completed: exams.filter(e => e.status === 'completed').length,
        draft: exams.filter(e => e.status === 'draft').length
      };

      // Calculate result statistics
      const resultStats = {
        total: results.length,
        averageScore: results.length > 0 ? 
          (results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length).toFixed(2) : 0,
        passRate: results.length > 0 ? 
          ((results.filter(r => (r.score || 0) >= 5).length / results.length) * 100).toFixed(1) : 0
      };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Báo cáo hệ thống
          </h1>
          <p className="mt-2 text-gray-600">
            Tổng quan chi tiết về hoạt động của hệ thống
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        {/* User Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thống kê người dùng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Exam Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thống kê đề thi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Result Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thống kê kết quả
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* System Health */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tình trạng hệ thống
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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