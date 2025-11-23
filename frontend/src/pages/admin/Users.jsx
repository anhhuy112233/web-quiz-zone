/**
 * Component Users - Trang quản lý người dùng cho admin
 * Cho phép admin xem, thêm, sửa, xóa tất cả người dùng trong hệ thống
 */

import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { getAuthHeaders, getApiUrl } from '../../utils/api';

/**
 * Users component
 * @returns {JSX.Element} Trang quản lý người dùng với bảng hiển thị và modal CRUD
 */
const Users = () => {
  // State quản lý danh sách người dùng và trạng thái
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // State quản lý modal và form
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    studentId: '',
    teacherId: '',
    classId: ''
  });

  // Effect để fetch danh sách người dùng và lớp học khi component mount
  useEffect(() => {
    fetchUsers();
    fetchClasses();
  }, []);

  /**
   * Fetch danh sách lớp học
   */
  const fetchClasses = async () => {
    try {
      const response = await fetch(getApiUrl('classes'), {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setClasses(data.data.classes || []);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  /**
   * Fetch danh sách tất cả người dùng từ API
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('users'), {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải danh sách người dùng');
      }
      setUsers(data.data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý thêm người dùng mới
   * @param {Event} e - Event submit form
   */
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validation dữ liệu đầu vào
    if (!formData.name || !formData.email || !formData.password) {
      setError('Tất cả các trường đều bắt buộc');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Gọi API tạo người dùng mới
      const response = await fetch(getApiUrl('users'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi tạo người dùng');
      }

      setSuccessMessage('Tạo người dùng thành công!');
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', role: 'student', studentId: '', teacherId: '', classId: '' });
      fetchUsers(); // Refresh danh sách
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý cập nhật thông tin người dùng
   * @param {Event} e - Event submit form
   */
  const handleEditUser = async (e) => {
    e.preventDefault();
    
    // Validation dữ liệu đầu vào
    if (!formData.name || !formData.email) {
      setError('Tên và email không được để trống');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Gọi API cập nhật người dùng
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      
      // Thêm các trường theo role
      if (formData.role === 'student') {
        if (formData.studentId) {
          updateData.studentId = formData.studentId.toUpperCase().trim();
        }
        if (formData.classId) {
          updateData.classId = formData.classId;
        }
      } else if (formData.role === 'teacher') {
        if (formData.teacherId) {
          updateData.teacherId = formData.teacherId.toUpperCase().trim();
        }
      }
      
      const response = await fetch(getApiUrl(`users/${selectedUser._id}`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật người dùng');
      }

      setSuccessMessage('Cập nhật người dùng thành công!');
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', password: '', role: 'student' });
      fetchUsers(); // Refresh danh sách
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xóa người dùng với xác nhận từ người dùng
   * @param {string} userId - ID của người dùng cần xóa
   */
  const handleDeleteUser = async (userId) => {
    // Hiển thị dialog xác nhận trước khi xóa
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Gọi API xóa người dùng
      const response = await fetch(getApiUrl(`users/${userId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi xóa người dùng');
      }

      setSuccessMessage('Xóa người dùng thành công!');
      fetchUsers(); // Refresh danh sách
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mở modal chỉnh sửa và điền dữ liệu người dùng vào form
   * @param {Object} user - Thông tin người dùng cần chỉnh sửa
   */
  const openEditModal = (user) => {
    setSelectedUser(user);
    console.log('Editing user:', user); // Debug log
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'student',
      studentId: user.studentId || '',
      teacherId: user.teacherId || '',
      classId: (user.classId && (user.classId._id || user.classId)) || ''
    });
    console.log('Form data set to:', { // Debug log
      studentId: user.studentId || '',
      teacherId: user.teacherId || '',
      classId: (user.classId && (user.classId._id || user.classId)) || ''
    });
    setShowEditModal(true);
  };

  /**
   * Chuyển đổi role sang tên hiển thị tiếng Việt
   * @param {string} role - Role của người dùng (student, teacher, admin)
   * @returns {string} Tên hiển thị tiếng Việt
   */
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'student':
        return 'Học sinh';
      case 'teacher':
        return 'Giáo viên';
      case 'admin':
        return 'Quản trị viên';
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Đang tải danh sách người dùng..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ==================== HEADER ==================== */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý người dùng
            </h1>
            <p className="mt-2 text-gray-600">
              Quản lý tất cả người dùng trong hệ thống
            </p>
          </div>
          {/* Nút thêm người dùng mới */}
          <Button
            onClick={() => setShowAddModal(true)}
          >
            ➕ Thêm người dùng
          </Button>
        </div>

        {/* Hiển thị lỗi và thông báo thành công */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        {successMessage && (
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        )}

        {/* ==================== TABLE OF USERS ==================== */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Header của bảng */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã SV/GV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lớp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tham gia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đăng nhập lần cuối
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              {/* Body của bảng */}
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    {/* Thông tin người dùng với avatar */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Vai trò với badge màu */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    {/* Mã SV/GV */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.role === 'student' ? (
                        <span className="font-medium text-gray-900">
                          {user.studentId || <span className="text-gray-400 italic">Chưa có mã</span>}
                        </span>
                      ) : user.role === 'teacher' ? (
                        <span className="font-medium text-gray-900">
                          {user.teacherId || <span className="text-gray-400 italic">Chưa có mã</span>}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    {/* Lớp */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.classId?.className || user.classId?.classCode || '-'}
                    </td>
                    {/* Ngày tạo tài khoản */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    {/* Lần đăng nhập cuối */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.lastLogin)}
                    </td>
                    {/* Các nút thao tác */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* Nút sửa người dùng */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(user)}
                        >
                          ✏️ Sửa
                        </Button>
                        {/* Nút xóa người dùng */}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          🗑️ Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ==================== ADD USER MODAL ==================== */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Thêm người dùng mới"
        >
          <form onSubmit={handleAddUser} className="space-y-4">
            {/* Trường họ và tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Nhập email"
                required
              />
            </div>

            {/* Trường mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            {/* Trường vai trò */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vai trò
              </label>
              <select
                value={formData.role}
                onChange={(e) => {
                  const newRole = e.target.value;
                  setFormData({
                    ...formData,
                    role: newRole,
                    studentId: newRole === 'student' ? formData.studentId : '',
                    teacherId: newRole === 'teacher' ? formData.teacherId : '',
                    classId: newRole === 'student' ? formData.classId : ''
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="student">Học sinh</option>
                <option value="teacher">Giáo viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>

            {/* Trường mã sinh viên (chỉ hiện khi role = student) */}
            {formData.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã sinh viên
                </label>
                <Input
                  type="text"
                  value={formData.studentId || ''}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value.toUpperCase()})}
                  placeholder="VD: SV001"
                />
              </div>
            )}

            {/* Trường mã giáo viên (chỉ hiện khi role = teacher) */}
            {formData.role === 'teacher' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã giáo viên
                </label>
                <Input
                  type="text"
                  value={formData.teacherId || ''}
                  onChange={(e) => setFormData({...formData, teacherId: e.target.value.toUpperCase()})}
                  placeholder="VD: GV001"
                />
              </div>
            )}

            {/* Trường lớp học (chỉ hiện khi role = student) */}
            {formData.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lớp học
                </label>
                <select
                  value={formData.classId || ''}
                  onChange={(e) => setFormData({...formData, classId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn lớp</option>
                  {classes.map((classItem) => (
                    <option key={classItem._id} value={classItem._id}>
                      {classItem.classCode} - {classItem.className}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Nút submit và hủy */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Đang tạo...' : 'Tạo người dùng'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddModal(false)}
                disabled={loading}
              >
                Hủy
              </Button>
            </div>
          </form>
        </Modal>

        {/* ==================== EDIT USER MODAL ==================== */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Chỉnh sửa người dùng"
        >
          <form onSubmit={handleEditUser} className="space-y-4">
            {/* Trường họ và tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Nhập email"
                required
              />
            </div>

            {/* Trường vai trò */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vai trò
              </label>
              <select
                value={formData.role}
                onChange={(e) => {
                  const newRole = e.target.value;
                  setFormData({
                    ...formData,
                    role: newRole,
                    studentId: newRole === 'student' ? formData.studentId : '',
                    teacherId: newRole === 'teacher' ? formData.teacherId : '',
                    classId: newRole === 'student' ? formData.classId : ''
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="student">Học sinh</option>
                <option value="teacher">Giáo viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>

            {/* Trường mã sinh viên (chỉ hiện khi role = student) */}
            {formData.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã sinh viên <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.studentId || ''}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value.toUpperCase()})}
                  placeholder="VD: SV001"
                  required
                />
                {!formData.studentId && (
                  <p className="mt-1 text-xs text-gray-500">Mã sinh viên là bắt buộc</p>
                )}
              </div>
            )}

            {/* Trường mã giáo viên (chỉ hiện khi role = teacher) */}
            {formData.role === 'teacher' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã giáo viên <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.teacherId || ''}
                  onChange={(e) => setFormData({...formData, teacherId: e.target.value.toUpperCase()})}
                  placeholder="VD: GV001"
                  required
                />
                {!formData.teacherId && (
                  <p className="mt-1 text-xs text-gray-500">Mã giáo viên là bắt buộc</p>
                )}
              </div>
            )}

            {/* Trường lớp học (chỉ hiện khi role = student) */}
            {formData.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lớp học
                </label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({...formData, classId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn lớp</option>
                  {classes.map((classItem) => (
                    <option key={classItem._id} value={classItem._id}>
                      {classItem.classCode} - {classItem.className}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Nút submit và hủy */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowEditModal(false)}
                disabled={loading}
              >
                Hủy
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Users; 