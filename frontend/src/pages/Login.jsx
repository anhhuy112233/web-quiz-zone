/**
 * Component Login - Trang đăng nhập
 * Cho phép user đăng nhập vào hệ thống với email và password
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import { createApiUrl } from './utils/api';

/**
 * Login component
 * @param {Function} onLogin - Callback khi đăng nhập thành công
 * @returns {JSX.Element} Form đăng nhập với validation và redirect
 */
const Login = ({ onLogin }) => {
  // State quản lý dữ liệu form và trạng thái
  const [formData, setFormData] = useState({
    email: '',      // Email đăng nhập
    password: ''    // Mật khẩu
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
   * Handler khi submit form đăng nhập
   * @param {Event} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ==================== API CALL ====================
      
      // Gọi API đăng nhập
      const response = await axios.post(createApiUrl('/api/auth/login'), formData);
      
      // Backend trả về: { status: 'success', token: '...', data: { user: {...} } }
      const { token, data } = response.data;
      const user = data.user;
      
      // ==================== SUCCESS HANDLING ====================
      
      // Gọi callback đăng nhập thành công
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
      
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
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
          Đăng nhập vào tài khoản
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Hoặc{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            đăng ký tài khoản mới
          </Link>
        </p>
      </div>

      {/* ==================== LOGIN FORM ==================== */}
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
                  autoComplete="current-password"
                  required
                  value={formData.password}
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
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 