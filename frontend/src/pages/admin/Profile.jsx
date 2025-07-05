import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import ProfileForm from '../../components/common/ProfileForm';
import ChangePasswordForm from '../../components/common/ChangePasswordForm';

const AdminProfile = ({ user }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Thông tin cá nhân
          </h1>
          <p className="mt-2 text-gray-600">
            Quản lý thông tin cá nhân và cài đặt tài khoản
          </p>
        </div>

        {successMessage && (
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-6">
                  <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                    Quản trị viên
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Họ và tên</h3>
                  <p className="text-gray-900">{user?.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Vai trò</h3>
                  <p className="text-gray-900">Quản trị viên</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Ngày tham gia</h3>
                  <p className="text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <Button
                  onClick={() => setShowProfileModal(true)}
                >
                  ✏️ Chỉnh sửa thông tin
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordModal(true)}
                >
                  🔒 Đổi mật khẩu
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thống kê nhanh
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tổng người dùng quản lý</span>
                  <span className="text-sm font-medium text-gray-900">150+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Đề thi trong hệ thống</span>
                  <span className="text-sm font-medium text-gray-900">25+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Kết quả thi</span>
                  <span className="text-sm font-medium text-gray-900">1,200+</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quyền hạn
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Quản lý tất cả người dùng</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Xem tất cả đề thi</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Xem báo cáo hệ thống</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Cấu hình hệ thống</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Xóa người dùng và đề thi</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Profile Edit Modal */}
        <Modal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          title="Chỉnh sửa thông tin cá nhân"
        >
          <ProfileForm
            user={user}
            onSuccess={(message) => {
              setSuccessMessage(message);
              setShowProfileModal(false);
            }}
            onCancel={() => setShowProfileModal(false)}
          />
        </Modal>

        {/* Change Password Modal */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Đổi mật khẩu"
        >
          <ChangePasswordForm
            onSuccess={(message) => {
              setSuccessMessage(message);
              setShowPasswordModal(false);
            }}
            onCancel={() => setShowPasswordModal(false)}
          />
        </Modal>
      </div>
    </div>
  );
};

export default AdminProfile; 