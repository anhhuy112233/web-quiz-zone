import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Alert from './Alert';
import { getAuthHeaders } from '../../utils/api';

const ProfileForm = ({ user, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Tên và email không được để trống');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật thông tin');
      }

      onUpdate(data.data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}
      
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