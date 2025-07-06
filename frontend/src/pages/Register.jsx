/**
 * Component Register - Trang đăng ký tài khoản
 * Cho phép user tạo tài khoản mới với các thông tin cơ bản và vai trò
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import { createApiUrl } from '../utils/api';

/**
 * Register component
 * @param {Function} onLogin - Callback khi đăng ký thành công (tự động đăng nhập)
 * @returns {JSX.Element} Form đăng ký với validation và role selection
 */
const Register = ({ onLogin }) => {
  // State quản lý dữ liệu form và trạng thái
  const [formData, setFormData] = useState({
    name: '',              // Họ và tên
    email: '',             // Email
    password: '',          // Mật khẩu
    confirmPassword: '',   // Xác nhận mật khẩu
    role: 'student'        // Vai trò (mặc định là student)
  });
  const [error, setError] = useState('');        // Thông báo lỗi
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const navigate = useNavigate();                // Hook navigation

  /**
   * Handler khi thay đổi giá trị input
   * @param {Event} e - Event object
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Handler khi submit form đăng ký
   * @param {Event} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // ==================== VALIDATION ====================
    
    // Kiểm tra mật khẩu xác nhận có khớp không
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      // ==================== API CALL ====================
      
      // Gọi API đăng ký
      const response = await axios.post(createApiUrl('/api/auth/register'), {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      // Backend trả về: { status: 'success', token: '...', data: { user: {...} } }
      const { token, data } = response.data;
      const user = data.user;
      
      // ==================== SUCCESS HANDLING ====================
      
      // Tự động đăng nhập sau khi đăng ký thành công
      onLogin(user, token);
      
      // Redirect dựa trên role của user
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      // ==================== ERROR HANDLING ====================
      
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* ==================== BACK TO HOME BUTTON ==================== */}
      <div className="absolute top-4 left-4">
        <Link to="/">
          <Button variant="outline" className="flex items-center space-x-2">
            <span>←</span>
            <span>Quay về trang chủ</span>
          </Button>
        </Link>
      </div>

      {/* ==================== HEADER SECTION ==================== */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Đăng ký tài khoản mới
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Hoặc{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            đăng nhập nếu đã có tài khoản
          </Link>
        </p>
      </div>

      {/* ==================== REGISTER FORM ==================== */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Hiển thị lỗi nếu có */}
          {error && (
            <Alert
              type="error" 
              message={error}
              className="mb-6"
            />
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Họ và tên field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Họ và tên
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Vai trò
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="student">Học sinh</option>
                  <option value="teacher">Giáo viên</option>
                </select>
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Confirm password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 