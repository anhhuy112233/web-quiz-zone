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
      const response = await fetch("http://localhost:5000/api/users/profile", {
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
    <div className="max-w-xl mx-auto py-8 px-4">
      {/* ==================== HEADER ==================== */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>
        <div className="flex gap-3">
          {/* Nút chỉnh sửa thông tin */}
          <Button
            onClick={() => setShowEditForm(true)}
          >
            ✏️ Chỉnh sửa thông tin
          </Button>
          {/* Nút đổi mật khẩu */}
          <Button
            variant="outline"
            onClick={() => setShowPasswordForm(true)}
          >
            🔒 Đổi mật khẩu
          </Button>
          {/* Nút quay về trang chủ */}
          <Button
            variant="secondary"
            onClick={() => navigate("/teacher/dashboard")}
          >
            Quay về trang chủ
          </Button>
        </div>
      </div>

      {/* Hiển thị lỗi và thông báo thành công */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}
      
      {successMessage && (
        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage("")} />
      )}

      {/* ==================== PROFILE INFORMATION CARD ==================== */}
      <Card title="👨‍🏫 Thông tin giáo viên">
        <div className="space-y-4">
          {/* Họ và tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">
              {user?.name || "N/A"}
            </div>
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">
              {user?.email || "N/A"}
            </div>
          </div>
          
          {/* Vai trò */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">
              {getRoleDisplayName(user?.role)}
            </div>
          </div>
          
          {/* Ngày tham gia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày tham gia
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">
              {formatDate(user?.createdAt)}
            </div>
          </div>
          
          {/* Đăng nhập lần cuối */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đăng nhập lần cuối
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">
              {formatDate(user?.lastLogin)}
            </div>
          </div>
          
          {/* Thống kê dành riêng cho giáo viên */}
          {user?.role === "teacher" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số đề thi đã tạo
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                  {user?.totalExams || 0}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

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
  );
};

export default Profile;
