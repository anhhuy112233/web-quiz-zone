/**
 * Component Classes - Trang quản lý lớp học cho admin
 * Cho phép admin xem, thêm, sửa, xóa lớp học và quản lý sinh viên trong lớp
 */

import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { getApiUrl, getAuthHeaders } from '../../utils/api';

/**
 * Classes component
 * @returns {JSX.Element} Trang quản lý lớp học với bảng hiển thị và modal CRUD
 */
const Classes = () => {
  // State quản lý danh sách lớp học và trạng thái
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // State quản lý modal và form
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [formData, setFormData] = useState({
    classCode: '',
    className: '',
    description: '',
    maxStudents: 50,
    teachers: []
  });

  // Effect để fetch danh sách lớp học khi component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  /**
   * Fetch danh sách tất cả lớp học từ API
   */
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const url = getApiUrl('classes');
      console.log('Fetching classes from:', url); // Debug log
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      console.log('Classes response:', data); // Debug log
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải danh sách lớp học');
      }
      setClasses(data.data.classes || []);
    } catch (err) {
      console.error('Error fetching classes:', err); // Debug log
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch danh sách sinh viên trong lớp
   */
  const fetchStudents = async (classId) => {
    try {
      const response = await fetch(getApiUrl(`classes/${classId}`), {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải danh sách sinh viên');
      }
      setStudents(data.data.class.students || []);
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Xử lý thêm lớp học mới
   */
  const handleAddClass = async (e) => {
    e.preventDefault();
    
    if (!formData.classCode || !formData.className) {
      setError('Mã lớp và tên lớp là bắt buộc');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const url = getApiUrl('classes');
      console.log('Creating class at:', url, formData); // Debug log
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi tạo lớp học');
      }

      setSuccessMessage('Tạo lớp học thành công!');
      setShowAddModal(false);
      setFormData({ classCode: '', className: '', description: '', maxStudents: 50, teachers: [] });
      fetchClasses();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý cập nhật lớp học
   */
  const handleUpdateClass = async (e) => {
    e.preventDefault();
    
    if (!formData.classCode || !formData.className) {
      setError('Mã lớp và tên lớp là bắt buộc');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(getApiUrl(`classes/${selectedClass._id}`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật lớp học');
      }

      setSuccessMessage('Cập nhật lớp học thành công!');
      setShowEditModal(false);
      setSelectedClass(null);
      fetchClasses();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý xóa lớp học
   */
  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(getApiUrl(`classes/${classId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi xóa lớp học');
      }

      setSuccessMessage('Xóa lớp học thành công!');
      fetchClasses();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mở modal chỉnh sửa
   */
  const handleEditClick = (classItem) => {
    setSelectedClass(classItem);
    setFormData({
      classCode: classItem.classCode || '',
      className: classItem.className || '',
      description: classItem.description || '',
      maxStudents: classItem.maxStudents || 50,
      teachers: classItem.teachers?.map(t => t._id) || []
    });
    setShowEditModal(true);
  };

  /**
   * Mở modal xem sinh viên
   */
  const handleViewStudents = async (classItem) => {
    setSelectedClass(classItem);
    setShowStudentsModal(true);
    await fetchStudents(classItem._id);
  };

  /**
   * Fetch danh sách sinh viên chưa có lớp hoặc có thể thêm vào lớp
   */
  const fetchAvailableStudents = async () => {
    try {
      const response = await fetch(getApiUrl('users?role=student'), {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        // Lọc ra những sinh viên chưa có lớp hoặc không thuộc lớp hiện tại
        const allStudents = data.data.users || [];
        const studentsNotInClass = allStudents.filter(student => 
          !student.classId || student.classId.toString() !== selectedClass?._id.toString()
        );
        setAvailableStudents(studentsNotInClass);
      }
    } catch (err) {
      console.error('Error fetching available students:', err);
      setError('Không thể tải danh sách sinh viên');
    }
  };

  /**
   * Xử lý thêm sinh viên vào lớp
   */
  const handleAddStudent = async () => {
    if (!selectedStudentId || !selectedClass) {
      setError('Vui lòng chọn sinh viên');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(getApiUrl(`classes/${selectedClass._id}/students`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ studentId: selectedStudentId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi thêm sinh viên');
      }

      setSuccessMessage('Thêm sinh viên vào lớp thành công!');
      setShowAddStudentModal(false);
      setSelectedStudentId('');
      await fetchStudents(selectedClass._id); // Refresh danh sách
      await fetchAvailableStudents(); // Refresh danh sách available
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý xóa sinh viên khỏi lớp
   */
  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sinh viên này khỏi lớp?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(getApiUrl(`classes/${selectedClass._id}/students/${studentId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi xóa sinh viên');
      }

      setSuccessMessage('Xóa sinh viên khỏi lớp thành công!');
      await fetchStudents(selectedClass._id); // Refresh danh sách
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý lớp học</h1>
            <p className="text-gray-600 mt-1">Quản lý tất cả lớp học trong hệ thống</p>
          </div>
          <Button
            onClick={() => {
              setFormData({ classCode: '', className: '', description: '', maxStudents: 50, teachers: [] });
              setShowAddModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            + Thêm lớp học
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
            className="mb-4"
          />
        )}
        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage('')}
            className="mb-4"
          />
        )}

        {/* Table */}
        {loading && !classes.length ? (
          <Loading />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã lớp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên lớp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số SV tối đa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classes.map((classItem) => (
                    <tr key={classItem._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{classItem.classCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{classItem.className}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{classItem.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{classItem.maxStudents}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          classItem.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : classItem.status === 'inactive'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {classItem.status === 'active' ? 'Hoạt động' : 
                           classItem.status === 'inactive' ? 'Tạm dừng' : 'Đã lưu trữ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewStudents(classItem)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Xem SV
                        </button>
                        <button
                          onClick={() => handleEditClick(classItem)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClass(classItem._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {classes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Chưa có lớp học nào
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Add Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Thêm lớp học mới"
        >
          <form onSubmit={handleAddClass}>
            <div className="space-y-4">
              <Input
                label="Mã lớp *"
                type="text"
                value={formData.classCode}
                onChange={(e) => setFormData({ ...formData, classCode: e.target.value.toUpperCase() })}
                required
                placeholder="VD: IT01"
              />
              <Input
                label="Tên lớp *"
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <Input
                label="Số sinh viên tối đa"
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                min="1"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="bg-gray-300 hover:bg-gray-400"
              >
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Tạo lớp học
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedClass(null);
          }}
          title="Chỉnh sửa lớp học"
        >
          <form onSubmit={handleUpdateClass}>
            <div className="space-y-4">
              <Input
                label="Mã lớp *"
                type="text"
                value={formData.classCode}
                onChange={(e) => setFormData({ ...formData, classCode: e.target.value.toUpperCase() })}
                required
              />
              <Input
                label="Tên lớp *"
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <Input
                label="Số sinh viên tối đa"
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                min="1"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedClass(null);
                }}
                className="bg-gray-300 hover:bg-gray-400"
              >
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Cập nhật
              </Button>
            </div>
          </form>
        </Modal>

        {/* Students Modal */}
        <Modal
          isOpen={showStudentsModal}
          onClose={() => {
            setShowStudentsModal(false);
            setSelectedClass(null);
            setStudents([]);
            setShowAddStudentModal(false);
          }}
          title={`Danh sách sinh viên - ${selectedClass?.className || ''}`}
          size="large"
        >
          <div className="space-y-4">
            {/* Nút thêm sinh viên */}
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setShowAddStudentModal(true);
                  fetchAvailableStudents();
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                + Thêm sinh viên
              </Button>
            </div>

            {/* Danh sách sinh viên */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <Loading />
              ) : students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Lớp học chưa có sinh viên nào
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Mã SV
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tên
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student._id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.studentId || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {student.email}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <Button
                            onClick={() => handleRemoveStudent(student._id)}
                            className="bg-red-600 hover:bg-red-700 text-sm px-3 py-1"
                            size="sm"
                          >
                            Xóa
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </Modal>

        {/* Add Student Modal */}
        <Modal
          isOpen={showAddStudentModal}
          onClose={() => {
            setShowAddStudentModal(false);
            setAvailableStudents([]);
            setSelectedStudentId('');
          }}
          title="Thêm sinh viên vào lớp"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn sinh viên
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn sinh viên --</option>
                {availableStudents.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.studentId || 'N/A'} - {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                onClick={() => {
                  setShowAddStudentModal(false);
                  setSelectedStudentId('');
                }}
                className="bg-gray-300 hover:bg-gray-400"
              >
                Hủy
              </Button>
              <Button
                onClick={handleAddStudent}
                className="bg-green-600 hover:bg-green-700"
                disabled={!selectedStudentId || loading}
              >
                {loading ? 'Đang thêm...' : 'Thêm sinh viên'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Classes;

