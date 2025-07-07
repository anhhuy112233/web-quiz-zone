/**
 * Component Students - Trang quản lý danh sách học sinh cho giáo viên
 * Hiển thị danh sách học sinh và kết quả thi của họ với chức năng tìm kiếm
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { formatDate } from '../../utils/dateUtils';
import { getAuthHeaders, createApiUrl } from '../../utils/api';

/**
 * Students component
 * @returns {JSX.Element} Trang danh sách học sinh với bảng hiển thị và tìm kiếm
 */
const Students = () => {
  const navigate = useNavigate();
  
  // State quản lý danh sách học sinh và trạng thái
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Effect để fetch danh sách học sinh khi component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  /**
   * Fetch danh sách tất cả học sinh từ API
   */
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(createApiUrl('/api/users?role=student'), {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải danh sách học sinh');
      }

      setStudents(data.data.users || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lọc danh sách học sinh theo từ khóa tìm kiếm
   * Tìm kiếm theo tên hoặc email
   */
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loading size="lg" text="Đang tải danh sách học sinh..." />
    </div>
  );

  // Hiển thị lỗi nếu có
  if (error) return (
    <div className="max-w-4xl mx-auto mt-8">
      <Alert type="error" message={error} onClose={() => setError('')} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* ==================== HEADER ==================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Danh sách học sinh đã làm bài thi</h1>
        {/* Ô tìm kiếm */}
        <input
          type="text"
          placeholder="Tìm kiếm học sinh..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* ==================== STUDENTS TABLE ==================== */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header của bảng */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên học sinh</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bài thi đã làm</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          {/* Body của bảng */}
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Hiển thị khi không tìm thấy học sinh */}
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Không tìm thấy học sinh nào.</td>
              </tr>
            ) : (
              /* Danh sách học sinh */
              filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  {/* Tên học sinh */}
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{student.name}</td>
                  
                  {/* Email học sinh */}
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{student.email}</td>
                  
                  {/* Danh sách bài thi đã làm */}
                  <td className="px-6 py-4">
                    {student.examResults && student.examResults.length > 0 ? (
                      <div className="space-y-1">
                        {student.examResults.map((result) => (
                          <div key={result._id} className="flex items-center justify-between">
                            <span className="text-gray-800">{result.exam.title}</span>
                            <span className="ml-2 font-semibold text-blue-600">{result.score}%</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Chưa có bài thi</span>
                    )}
                  </td>
                  
                  {/* Nút thao tác */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => navigate(`/teacher/students/${student._id}`)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow transition-colors"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Students; 