/**
 * Component Profile - Trang thông tin cá nhân cho giáo viên
 * Cho phép giáo viên xem, chỉnh sửa thông tin cá nhân và đổi mật khẩu
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Alert from "../../components/common/Alert";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal";
import ProfileForm from "../../components/common/ProfileForm";
import ChangePasswordForm from "../../components/common/ChangePasswordForm";
import { getAuthHeaders } from "../../utils/api";

/**
 * Profile component
 * @returns {JSX.Element} Trang thông tin cá nhân với form chỉnh sửa và đổi mật khẩu
 */
const Profile = () => {
  const navigate = useNavigate();
  
  // State quản lý trạng thái và dữ liệu
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể tải thông tin cá nhân");
      }
      setUser(data.data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Chuyển đổi role sang tên hiển thị tiếng Việt
   * @param {string} role - Role của người dùng
   * @returns {string} Tên hiển thị tiếng Việt
   */
  const getRoleDisplayName = (role) => {
    switch (role) {
      case "student":
        return "Học sinh";
      case "teacher":
        return "Giáo viên";
      case "admin":
        return "Quản trị viên";
      default:
        return role;
    }
  };

  /**
   * Format ngày tháng theo định dạng Việt Nam
   * @param {string} dateString - Chuỗi ngày tháng
   * @returns {string} Ngày tháng đã format
   */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Xử lý khi cập nhật thông tin profile thành công
   * @param {Object} updatedUser - Thông tin người dùng đã cập nhật
   */
  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    setShowEditForm(false);
    setSuccessMessage("Cập nhật thông tin thành công!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  /**
   * Xử lý khi đổi mật khẩu thành công
   * @param {string} message - Thông báo thành công
   */
  const handlePasswordChange = (message) => {
    setShowPasswordForm(false);
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Đang tải thông tin..." />
      </div>
    );
  }

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
                Xem và quản lý thông tin tài khoản của bạn
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate("/teacher/dashboard")}
              className="w-full sm:w-auto"
            >
              ← Quay về trang chủ
            </Button>
          </div>
        </div>

        {/* Hiển thị lỗi và thông báo thành công */}
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError("")} />
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4">
            <Alert type="success" message={successMessage} onClose={() => setSuccessMessage("")} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ==================== PROFILE INFORMATION CARD ==================== */}
          <div className="lg:col-span-2">
            <Card title="👨‍🏫 Thông tin giáo viên">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Họ và tên */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5">
                    Họ và tên
                  </label>
                  <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base">
                    {user?.name || "N/A"}
                  </div>
                </div>
                
                {/* Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5">
                    Email
                  </label>
                  <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base break-all">
                    {user?.email || "N/A"}
                  </div>
                </div>
                
                {/* Mã giáo viên */}
                {user?.teacherId && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5">Mã giáo viên</label>
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base font-mono">
                      {user.teacherId}
                    </div>
                  </div>
                )}
                
                {/* Vai trò */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5">
                    Vai trò
                  </label>
                  <div className="px-3 py-2.5 bg-purple-50 border border-purple-200 rounded-lg">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {getRoleDisplayName(user?.role)}
                    </span>
                  </div>
                </div>
                
                {/* Ngày tham gia */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5">
                    Ngày tham gia
                  </label>
                  <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base">
                    {formatDate(user?.createdAt)}
                  </div>
                </div>
                
                {/* Đăng nhập lần cuối */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5">
                    Đăng nhập lần cuối
                  </label>
                  <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base">
                    {formatDate(user?.lastLogin)}
                  </div>
                </div>
              </div>

              {/* Thống kê dành riêng cho giáo viên */}
              {user?.role === "teacher" && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Thống kê giảng dạy</h3>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="text-xs sm:text-sm text-purple-600 font-medium mb-1">Số đề thi đã tạo</div>
                    <div className="text-xl sm:text-2xl font-bold text-purple-900">{user?.totalExams || 0}</div>
                  </div>
                </div>
              )}

              {/* Các nút thao tác */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setShowEditForm(true)}
                    className="flex-1"
                  >
                    ✏️ Chỉnh sửa thông tin
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordForm(true)}
                    className="flex-1"
                  >
                    🔒 Đổi mật khẩu
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* ==================== SIDEBAR ACTIONS ==================== */}
          <div className="space-y-4">
            <Card title="Thao tác nhanh">
              <div className="space-y-3">
                <Button
                  onClick={() => setShowEditForm(true)}
                  className="w-full justify-center"
                  variant="primary"
                >
                  ✏️ Chỉnh sửa
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full justify-center"
                >
                  🔒 Đổi mật khẩu
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/teacher/dashboard")}
                  className="w-full justify-center"
                >
                  ← Trang chủ
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* ==================== EDIT PROFILE MODAL ==================== */}
        <Modal
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          title="Chỉnh sửa thông tin cá nhân"
        >
          <ProfileForm
            user={user}
            onUpdate={handleProfileUpdate}
            onCancel={() => setShowEditForm(false)}
          />
        </Modal>

        {/* ==================== CHANGE PASSWORD MODAL ==================== */}
        <Modal
          isOpen={showPasswordForm}
          onClose={() => setShowPasswordForm(false)}
          title="Đổi mật khẩu"
        >
          <ChangePasswordForm
            onSuccess={handlePasswordChange}
            onCancel={() => setShowPasswordForm(false)}
          />
        </Modal>
      </div>
    </div>
  );
};

export default Profile;
