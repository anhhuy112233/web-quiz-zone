/**
 * Component AdminExams - Trang quản lý đề thi cho admin
 * Cho phép admin xem, quản lý tất cả đề thi trong hệ thống từ mọi giáo viên
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import { getAuthHeaders } from '../../utils/api';

/**
 * AdminExams component
 * @returns {JSX.Element} Trang quản lý đề thi với bảng hiển thị và các thao tác CRUD
 */
const AdminExams = () => {
  // State quản lý danh sách đề thi và trạng thái
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Effect để fetch danh sách đề thi khi component mount
  useEffect(() => {
    fetchExams();
  }, []);

  /**
   * Fetch danh sách tất cả đề thi từ API
   */
  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/exams', {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải danh sách đề thi');
      }
      setExams(data.data.exams);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Chuyển đổi trạng thái đề thi sang tên hiển thị tiếng Việt
   * @param {string} status - Trạng thái đề thi (draft, scheduled, active, completed)
   * @returns {string} Tên hiển thị tiếng Việt
   */
  const getStatusDisplayName = (status) => {
    switch (status) {
      case 'draft':
        return 'Nháp';
      case 'scheduled':
        return 'Đã lên lịch';
      case 'active':
        return 'Đang diễn ra';
      case 'completed':
        return 'Đã kết thúc';
      default:
        return status;
    }
  };

  /**
   * Lấy màu sắc CSS cho badge trạng thái
   * @param {string} status - Trạng thái đề thi
   * @returns {string} CSS classes cho màu sắc
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Format ngày giờ theo định dạng Việt Nam
   * @param {string} dateString - Chuỗi ngày giờ
   * @returns {string} Ngày giờ đã format
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Xóa đề thi với xác nhận từ người dùng
   * @param {string} examId - ID của đề thi cần xóa
   */
  const handleDeleteExam = async (examId) => {
    // Hiển thị dialog xác nhận trước khi xóa
    if (!window.confirm('Bạn có chắc chắn muốn xóa đề thi này?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Gọi API xóa đề thi
      const response = await fetch(`http://localhost:5000/api/exams/${examId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi xóa đề thi');
      }

      // Refresh danh sách sau khi xóa thành công
      fetchExams();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Đang tải danh sách đề thi..." />
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
              Quản lý đề thi
            </h1>
            <p className="mt-2 text-gray-600">
              Quản lý tất cả đề thi trong hệ thống
            </p>
          </div>
          {/* Nút tạo đề thi mới - chuyển đến trang teacher */}
          <Link to="/teacher/create-exam">
            <Button>
              ➕ Tạo đề thi mới
            </Button>
          </Link>
        </div>

        {/* Hiển thị lỗi nếu có */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        {/* ==================== TABLE OF EXAMS ==================== */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Header của bảng */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đề thi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giáo viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              {/* Body của bảng */}
              <tbody className="bg-white divide-y divide-gray-200">
                {exams.map((exam) => (
                  <tr key={exam._id}>
                    {/* Thông tin đề thi */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {exam.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {exam.totalQuestions} câu hỏi • {exam.duration} phút
                        </div>
                      </div>
                    </td>
                    {/* Thông tin giáo viên tạo đề */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {exam.createdBy?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {exam.createdBy?.email || 'N/A'}
                      </div>
                    </td>
                    {/* Trạng thái đề thi với badge màu */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(exam.status)}`}>
                        {getStatusDisplayName(exam.status)}
                      </span>
                    </td>
                    {/* Thời gian bắt đầu và kết thúc */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>Bắt đầu: {formatDate(exam.startTime)}</div>
                        <div>Kết thúc: {formatDate(exam.endTime)}</div>
                      </div>
                    </td>
                    {/* Các nút thao tác */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* Nút sửa đề thi */}
                        <Link to={`/teacher/exams/${exam._id}/edit`}>
                          <Button variant="outline" size="sm">
                            ✏️ Sửa
                          </Button>
                        </Link>
                        {/* Nút theo dõi đề thi đang diễn ra */}
                        <Link to={`/teacher/exams/${exam._id}/monitor`}>
                          <Button variant="outline" size="sm">
                            👁️ Theo dõi
                          </Button>
                        </Link>
                        {/* Nút xem kết quả */}
                        <Link to={`/teacher/exams/${exam._id}/results`}>
                          <Button variant="outline" size="sm">
                            📊 Kết quả
                          </Button>
                        </Link>
                        {/* Nút xóa đề thi */}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteExam(exam._id)}
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

        {/* ==================== EMPTY STATE ==================== */}
        {/* Hiển thị khi chưa có đề thi nào */}
        {exams.length === 0 && !loading && (
          <Card className="text-center py-12">
            <div className="text-gray-500">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium mb-2">Chưa có đề thi nào</h3>
              <p className="mb-4">Bắt đầu tạo đề thi đầu tiên để quản lý hệ thống</p>
              <Link to="/teacher/create-exam">
                <Button>
                  Tạo đề thi đầu tiên
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminExams; 