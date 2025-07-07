/**
 * Component StudentExams - Trang danh sách đề thi cho học sinh
 * Hiển thị danh sách các đề thi có sẵn và cho phép học sinh tham gia
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import { getAuthHeaders, createApiUrl } from '../../utils/api';

/**
 * StudentExams component
 * @returns {JSX.Element} Trang danh sách đề thi với thông tin chi tiết và nút tham gia
 */
const StudentExams = () => {
  // State quản lý danh sách đề thi và trạng thái
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Effect để fetch danh sách đề thi khi component mount
  useEffect(() => {
    fetchExams();
  }, []);

  /**
   * Fetch danh sách tất cả đề thi có sẵn
   */
  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch(createApiUrl('/api/exams'), {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải danh sách đề thi');
      }

      setExams(data.data.exams || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format ngày tháng theo định dạng Việt Nam
   * @param {string} date - Chuỗi ngày tháng
   * @returns {string} Ngày tháng đã format
   */
  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* ==================== HEADER ==================== */}
      <h1 className="text-2xl font-bold mb-6">Danh sách kỳ thi</h1>
      
      {/* ==================== LOADING AND ERROR STATES ==================== */}
      {loading && <Loading />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      
      {/* Hiển thị khi không có đề thi nào */}
      {!loading && exams.length === 0 && (
        <div className="text-center text-gray-500">Hiện chưa có kỳ thi nào.</div>
      )}
      
      {/* ==================== EXAMS LIST ==================== */}
      {!loading && exams.length > 0 && (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div key={exam._id} className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between">
              {/* Thông tin đề thi */}
              <div>
                <div className="font-semibold text-lg">{exam.title}</div>
                <div className="text-gray-600 text-sm">{exam.description}</div>
                <div className="text-gray-500 text-xs mt-1">
                  Thời gian: {formatDate(exam.startTime)} - {formatDate(exam.endTime)}
                </div>
                <div className="text-gray-500 text-xs">Số câu hỏi: {exam.totalQuestions}</div>
              </div>
              
              {/* Nút thao tác */}
              <div className="mt-4 md:mt-0 flex items-center space-x-2">
                {/* Kiểm tra xem có thể tham gia bài thi không */}
                {exam.status === 'scheduled' && new Date(exam.startTime) <= new Date() && new Date(exam.endTime) >= new Date() ? (
                  <Button variant="primary" onClick={() => window.location.href = `/student/exams/${exam._id}/start`}>
                    Tham gia
                  </Button>
                ) : (
                  <span className="text-gray-400 text-sm">Chưa đến thời gian hoặc đã kết thúc</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentExams; 