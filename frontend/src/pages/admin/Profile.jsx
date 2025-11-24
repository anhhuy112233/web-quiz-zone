/**
 * Component AdminProfile - Trang profile cho admin
 * Hiển thị thông tin cá nhân admin và cho phép chỉnh sửa thông tin, đổi mật khẩu
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import ProfileForm from '../../components/common/ProfileForm';
import ChangePasswordForm from '../../components/common/ChangePasswordForm';
import { getAuthHeaders } from '../../utils/api';

/**
 * AdminProfile component
 * @returns {JSX.Element} Trang profile với thông tin cá nhân và các modal chỉnh sửa
 */
const AdminProfile = () => {
  const navigate = useNavigate();
  // State quản lý modal và thông báo
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);    // Modal chỉnh sửa thông tin
  const [showPasswordModal, setShowPasswordModal] = useState(false);  // Modal đổi mật khẩu
  const [successMessage, setSuccessMessage] = useState('');           // Thông báo thành công

  // Effect để fetch thông tin người dùng khi component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  /**
   * Fetch thông tin profile của người dùng hiện tại
   */
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/profile`, {
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

  /**
   * Xử lý khi cập nhật thông tin profile thành công
   */
  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    setShowProfileModal(false);
    setSuccessMessage('Cập nhật thông tin thành công!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  /**
   * Xử lý khi đổi mật khẩu thành công
   */
  const handlePasswordChange = (message) => {
    setShowPasswordModal(false);
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Đang tải thông tin..." />
      </div>
    );
  }

  /**
   * Format ngày tháng theo định dạng Việt Nam
   */
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ==================== HEADER ==================== */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Thông tin cá nhân
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Quản lý thông tin cá nhân và cài đặt tài khoản
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/users')}
              className="w-full sm:w-auto"
            >
              ← Quay về trang chủ
            </Button>
          </div>
        </div>

        {/* Hiển thị lỗi và thông báo thành công */}
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4">
            <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ==================== PROFILE INFORMATION ==================== */}
          <div className="lg:col-span-2">
            <Card title="👤 Thông tin quản trị viên">
              {/* Avatar và thông tin cơ bản */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg mb-4 sm:mb-0">
                  <span className="text-white text-2xl sm:text-3xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="sm:ml-6 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{user?.name}</h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-1 break-all">{user?.email}</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                    Quản trị viên
                  </span>
                </div>
              </div>

              {/* Chi tiết thông tin cá nhân */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5">Họ và tên</label>
                  <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base">
                    {user?.name}
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5">Email</label>
                  <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base break-all">
                    {user?.email}
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5">Vai trò</label>
                  <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Quản trị viên
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5">Ngày tham gia</label>
                  <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base">
                    {formatDate(user?.createdAt)}
                  </div>
                </div>
              </div>

              {/* Các nút thao tác */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setShowProfileModal(true)}
                    className="flex-1"
                  >
                    ✏️ Chỉnh sửa thông tin
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordModal(true)}
                    className="flex-1"
                  >
                    🔒 Đổi mật khẩu
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* ==================== SIDEBAR ==================== */}
          <div className="space-y-4">
            {/* Thao tác nhanh */}
            <Card title="Thao tác nhanh">
              <div className="space-y-3">
                <Button
                  onClick={() => setShowProfileModal(true)}
                  className="w-full justify-center"
                  variant="primary"
                >
                  ✏️ Chỉnh sửa
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full justify-center"
                >
                  🔒 Đổi mật khẩu
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/admin/users')}
                  className="w-full justify-center"
                >
                  ← Trang chủ
                </Button>
              </div>
            </Card>

            {/* Quyền hạn */}
            <Card title="Quyền hạn">
              <div className="space-y-2.5">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-gray-700">Quản lý tất cả người dùng</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-gray-700">Xem tất cả đề thi</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-gray-700">Xem báo cáo hệ thống</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-gray-700">Cấu hình hệ thống</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-gray-700">Xóa người dùng và đề thi</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ==================== MODALS ==================== */}
        
        {/* Modal chỉnh sửa thông tin cá nhân */}
        <Modal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          title="Chỉnh sửa thông tin cá nhân"
        >
          <ProfileForm
            user={user}
            onUpdate={handleProfileUpdate}
            onCancel={() => setShowProfileModal(false)}
          />
        </Modal>

        {/* Modal đổi mật khẩu */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Đổi mật khẩu"
        >
          <ChangePasswordForm
            onSuccess={handlePasswordChange}
            onCancel={() => setShowPasswordModal(false)}
          />
        </Modal>
      </div>
    </div>
  );
};

export default AdminProfile; 