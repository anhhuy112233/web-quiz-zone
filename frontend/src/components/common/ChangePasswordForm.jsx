/**
 * Component ChangePasswordForm - Form đổi mật khẩu
 * Cho phép user thay đổi mật khẩu với validation và bảo mật
 */

import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Alert from './Alert';
import { getAuthHeaders, createApiUrl } from '../../utils/api';

/**
 * ChangePasswordForm component
 * @param {Function} onSuccess - Callback khi đổi mật khẩu thành công
 * @param {Function} onCancel - Callback khi hủy thao tác
 * @returns {JSX.Element} Form đổi mật khẩu với validation
 */
const ChangePasswordForm = ({ onSuccess, onCancel }) => {
  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    currentPassword: '',    // Mật khẩu hiện tại
    newPassword: '',        // Mật khẩu mới
    confirmPassword: ''     // Xác nhận mật khẩu mới
  });
  
  // State quản lý trạng thái loading và lỗi
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handler khi thay đổi giá trị input
   * @param {Event} e - Event object
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handler khi submit form
   * @param {Event} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ==================== VALIDATION ====================
    
    // Kiểm tra các trường bắt buộc
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Tất cả các trường đều bắt buộc');
      return;
    }

    // Kiểm tra độ dài mật khẩu mới
    if (formData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    // Kiểm tra mật khẩu xác nhận có khớp không
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    // ==================== API CALL ====================
    
    try {
      setLoading(true);
      setError('');
      
      // Gọi API đổi mật khẩu
      const response = await fetch(createApiUrl('/api/users/change-password'), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      // Kiểm tra response
      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi đổi mật khẩu');
      }

      // ==================== SUCCESS HANDLING ====================
      
      // Reset form về trạng thái ban đầu
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Gọi callback thành công
      onSuccess(data.message);
    } catch (err) {
      // Xử lý lỗi
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Hiển thị lỗi nếu có */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}
      
      {/* Trường mật khẩu hiện tại */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mật khẩu hiện tại
        </label>
        <Input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          placeholder="Nhập mật khẩu hiện tại"
          required
        />
      </div>

      {/* Trường mật khẩu mới */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mật khẩu mới
        </label>
        <Input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
          required
        />
      </div>

      {/* Trường xác nhận mật khẩu mới */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Xác nhận mật khẩu mới
        </label>
        <Input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Nhập lại mật khẩu mới"
          required
        />
      </div>

      {/* Các nút thao tác */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Hủy
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm; 