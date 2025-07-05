import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { getAuthHeaders } from '../../utils/api';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExams: 0,
    totalResults: 0,
    activeExams: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch users count
      const usersResponse = await fetch('http://localhost:5000/api/users', {
        headers: getAuthHeaders()
      });
      const usersData = await usersResponse.json();
      const totalUsers = usersData.data?.users?.length || 0;

      // Fetch exams count
      const examsResponse = await fetch('http://localhost:5000/api/exams', {
        headers: getAuthHeaders()
      });
      const examsData = await examsResponse.json();
      const totalExams = examsData.data?.exams?.length || 0;

      // Fetch results count
      const resultsResponse = await fetch('http://localhost:5000/api/results', {
        headers: getAuthHeaders()
      });
      const resultsData = await resultsResponse.json();
      const totalResults = resultsData.data?.results?.length || 0;

      // Calculate active exams (exams with status 'active')
      const activeExams = examsData.data?.exams?.filter(exam => exam.status === 'active').length || 0;

      setStats({
        totalUsers,
        totalExams,
        totalResults,
        activeExams
      });
    } catch (err) {
      setError('Không thể tải thống kê dashboard');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
        {
      title: 'Quản lý người dùng',
      description: 'Thêm, sửa, xóa người dùng',
      icon: '👥',
      link: '/admin/users',
      color: 'bg-blue-500'
        },
        {
      title: 'Quản lý đề thi',
      description: 'Tạo và quản lý đề thi',
      icon: '📝',
      link: '/admin/exams',
      color: 'bg-green-500'
    },
    {
      title: 'Xem báo cáo',
      description: 'Thống kê và báo cáo',
      icon: '📊',
      link: '/admin/reports',
      color: 'bg-purple-500'
        },
        {
      title: 'Cài đặt hệ thống',
      description: 'Cấu hình hệ thống',
      icon: '⚙️',
      link: '/admin/settings',
      color: 'bg-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Đang tải thống kê..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Admin
          </h1>
          <p className="mt-2 text-gray-600">
            Chào mừng {user?.name}, đây là tổng quan hệ thống
          </p>
      </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-lg">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng người dùng</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
        </Card>

          <Card className="bg-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-lg">📝</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng đề thi</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalExams}</p>
              </div>
            </div>
        </Card>

          <Card className="bg-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-lg">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng kết quả</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalResults}</p>
              </div>
            </div>
        </Card>

          <Card className="bg-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-lg">⏰</span>
      </div>
                  </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Đề thi đang hoạt động</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeExams}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="block group"
              >
                <Card className="bg-white hover:shadow-lg transition-shadow duration-200">
                  <div className="text-center">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <span className="text-2xl">{action.icon}</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Hoạt động gần đây
          </h2>
          <Card className="bg-white">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Người dùng mới đăng ký: Nguyễn Văn A</span>
                </div>
                <span className="text-xs text-gray-500">2 phút trước</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Đề thi mới được tạo: Toán học lớp 10</span>
                </div>
                <span className="text-xs text-gray-500">15 phút trước</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Kết quả thi được cập nhật</span>
                </div>
                <span className="text-xs text-gray-500">1 giờ trước</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 