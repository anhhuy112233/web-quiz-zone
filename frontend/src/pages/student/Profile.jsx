import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import { getAuthHeaders } from '../../utils/api';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải thông tin cá nhân');
      }
      setUser(data.data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'student':
        return 'Học sinh';
      case 'teacher':
        return 'Giáo viên';
      case 'admin':
        return 'Quản trị viên';
      default:
        return role;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Đang tải thông tin..." />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>
        <Button
          variant="secondary"
          onClick={() => navigate('/student/dashboard')}
        >
          Quay về trang chủ
        </Button>
      </div>
      
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}
      
      <Card title="📋 Thông tin cá nhân">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">{user?.name || 'N/A'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">{user?.email || 'N/A'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">{getRoleDisplayName(user?.role)}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tham gia</label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">{formatDate(user?.createdAt)}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đăng nhập lần cuối</label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">{formatDate(user?.lastLogin)}</div>
          </div>
          {user?.role === 'student' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số bài thi đã hoàn thành</label>
                <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">{user?.completedExams || 0}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Điểm trung bình</label>
                <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">{user?.averageScore || 0}/100</div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile; 