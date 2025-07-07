/**
 * Component ProfileForm - Form cập nhật thông tin cá nhân
 * Cho phép user cập nhật thông tin profile như tên và email
 */

import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Alert from './Alert';
import { getAuthHeaders, createApiUrl } from '../../utils/api';

/**
 * ProfileForm component
 * @param {Object} user - Thông tin user hiện tại
 * @param {Function} onUpdate - Callback khi cập nhật thành công
 * @param {Function} onCancel - Callback khi hủy thao tác
 * @returns {JSX.Element} Form cập nhật thông tin profile
 */
const ProfileForm = ({ user, onUpdate, onCancel }) => {
  // State quản lý dữ liệu form, khởi tạo từ thông tin user hiện tại
  const [formData, setFormData] = useState({
    name: user?.name || '',    // Tên user
    email: user?.email || ''   // Email user
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
    
    // Kiểm tra tên và email không được để trống
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Tên và email không được để trống');
      return;
    }

    // ==================== API CALL ====================
    
    try {
      setLoading(true);
      setError('');
      
      // Gọi API cập nhật thông tin profile
      const response = await fetch(createApiUrl('/api/users/profile'), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      // Kiểm tra response
      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật thông tin');
      }

      // ==================== SUCCESS HANDLING ====================
      
      // Gọi callback cập nhật thành công
      onUpdate(data.data.user);
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
      
      {/* Trường họ và tên */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Họ và tên
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nhập họ và tên"
          required
        />
      </div>

      {/* Trường email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Nhập email"
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
          {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
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

export default ProfileForm; 