/**
 * Component Settings - Trang cài đặt hệ thống cho admin
 * Cho phép admin cấu hình các thông số hệ thống thi trắc nghiệm
 */

import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import { getAuthHeaders, createApiUrl } from '../../utils/api';

/**
 * Settings component
 * @returns {JSX.Element} Trang cài đặt hệ thống với các form cấu hình
 */
const Settings = () => {
  // State quản lý cài đặt hệ thống
  const [settings, setSettings] = useState({
    systemName: 'Hệ thống thi trắc nghiệm',  // Tên hệ thống
    maxExamDuration: 120,                     // Thời gian thi tối đa (phút)
    passScore: 5,                             // Điểm đạt tối thiểu
    allowRetake: false,                       // Cho phép thi lại
    autoSubmit: true,                         // Tự động nộp bài
    emailNotifications: true,                 // Thông báo qua email
    maintenanceMode: false                    // Chế độ bảo trì
  });
  
  // State quản lý trạng thái loading và saving
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Effect để fetch cài đặt khi component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  /**
   * Fetch cài đặt hệ thống từ API
   */
  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Trong thực tế, bạn sẽ gọi API để lấy cài đặt
      // const response = await fetch(createApiUrl('/api/admin/settings'), {
      //   headers: getAuthHeaders()
      // });
      // const data = await response.json();
      // setSettings(data.settings);
      
      // Tạm thời sử dụng dữ liệu mẫu
      setTimeout(() => {
        setSettings({
          systemName: 'Hệ thống thi trắc nghiệm',
          maxExamDuration: 120,
          passScore: 5,
          allowRetake: false,
          autoSubmit: true,
          emailNotifications: true,
          maintenanceMode: false
        });
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('Không thể tải cài đặt hệ thống');
      setLoading(false);
    }
  };

  /**
   * Handler khi lưu cài đặt
   * @param {Event} e - Event object
   */
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      // Trong thực tế, bạn sẽ gọi API để lưu cài đặt
      // const response = await fetch(createApiUrl('/api/admin/settings'), {
      //   method: 'PUT',
      //   headers: getAuthHeaders(),
      //   body: JSON.stringify(settings)
      // });

      // const data = await response.json();

      // if (!response.ok) {
      //   throw new Error(data.message || 'Có lỗi xảy ra khi lưu cài đặt');
      // }

      // Giả lập lưu thành công
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Cài đặt đã được lưu thành công!');
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handler khi thay đổi giá trị input
   * @param {string} field - Tên trường cần thay đổi
   * @param {any} value - Giá trị mới
   */
  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Đang tải cài đặt..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ==================== HEADER ==================== */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Cài đặt hệ thống
          </h1>
          <p className="mt-2 text-gray-600">
            Cấu hình các thông số của hệ thống thi trắc nghiệm
          </p>
        </div>

        {/* Hiển thị lỗi và thông báo thành công */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        {successMessage && (
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        )}

        <form onSubmit={handleSaveSettings}>
          {/* ==================== GENERAL SETTINGS ==================== */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Cài đặt chung
            </h2>
            <div className="space-y-4">
              {/* Tên hệ thống */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên hệ thống
                </label>
                <Input
                  type="text"
                  value={settings.systemName}
                  onChange={(e) => handleInputChange('systemName', e.target.value)}
                  placeholder="Nhập tên hệ thống"
                />
              </div>

              {/* Thời gian thi tối đa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian thi tối đa (phút)
                </label>
                <Input
                  type="number"
                  value={settings.maxExamDuration}
                  onChange={(e) => handleInputChange('maxExamDuration', parseInt(e.target.value))}
                  min="30"
                  max="300"
                />
              </div>

              {/* Điểm đạt tối thiểu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Điểm đạt tối thiểu (thang điểm 10)
                </label>
                <Input
                  type="number"
                  value={settings.passScore}
                  onChange={(e) => handleInputChange('passScore', parseFloat(e.target.value))}
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
            </div>
          </Card>

          {/* ==================== EXAM SETTINGS ==================== */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Cài đặt đề thi
            </h2>
            <div className="space-y-4">
              {/* Cho phép thi lại */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Cho phép thi lại</h3>
                  <p className="text-sm text-gray-500">Học sinh có thể thi lại đề thi đã hoàn thành</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowRetake}
                    onChange={(e) => handleInputChange('allowRetake', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Tự động nộp bài */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Tự động nộp bài</h3>
                  <p className="text-sm text-gray-500">Tự động nộp bài khi hết thời gian</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSubmit}
                    onChange={(e) => handleInputChange('autoSubmit', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* ==================== NOTIFICATION SETTINGS ==================== */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Cài đặt thông báo
            </h2>
            <div className="space-y-4">
              {/* Thông báo qua email */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Thông báo qua email</h3>
                  <p className="text-sm text-gray-500">Gửi thông báo kết quả thi qua email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* ==================== SYSTEM MAINTENANCE ==================== */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Bảo trì hệ thống
            </h2>
            <div className="space-y-4">
              {/* Chế độ bảo trì */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Chế độ bảo trì</h3>
                  <p className="text-sm text-gray-500">Tạm thời khóa hệ thống để bảo trì</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Cảnh báo khi bật chế độ bảo trì */}
              {settings.maintenanceMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Chế độ bảo trì đang bật
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Hệ thống sẽ hiển thị thông báo bảo trì cho tất cả người dùng. 
                          Chỉ admin mới có thể truy cập hệ thống trong chế độ này.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* ==================== ACTION BUTTONS ==================== */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={fetchSettings}
              disabled={saving}
            >
              Khôi phục
            </Button>
            <Button
              type="submit"
              loading={saving}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings; 