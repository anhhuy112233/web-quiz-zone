/**
 * Component ExamResults - Trang quản lý kết quả thi cho giáo viên
 * Hiển thị tổng quan kết quả thi, thống kê học sinh và danh sách đề thi
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { getAuthHeaders, createApiUrl } from '../../utils/api';

/**
 * ExamResults component
 * @returns {JSX.Element} Trang quản lý kết quả với thống kê tổng quan và phân tích học sinh
 */
const ExamResults = () => {
  const navigate = useNavigate();
  
  // State quản lý dữ liệu và trạng thái
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Effect để fetch tất cả dữ liệu khi component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  /**
   * Fetch tất cả dữ liệu cần thiết cho trang kết quả
   */
  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // ==================== FETCH EXAMS ====================
      
      // Lấy danh sách tất cả đề thi
      const examsResponse = await fetch(createApiUrl('/api/exams'), {
        headers: getAuthHeaders()
      });
      const examsData = await examsResponse.json();
      
      if (!examsResponse.ok) {
        throw new Error(examsData.message || 'Không thể tải danh sách đề thi');
      }
      setExams(examsData.data.exams || []);

      // ==================== FETCH RESULTS ====================
      
      // Lấy tất cả kết quả thi
      const resultsResponse = await fetch(createApiUrl('/api/results'), {
        headers: getAuthHeaders()
      });
      const resultsData = await resultsResponse.json();
      setAllResults(resultsResponse.ok ? (resultsData.data.results || []) : []);

      // ==================== FETCH STUDENTS ====================
      
      // Lấy danh sách học sinh
      const studentsResponse = await fetch(createApiUrl('/api/users?role=student'), {
        headers: getAuthHeaders()
      });
      const studentsData = await studentsResponse.json();
      setStudents(studentsResponse.ok ? (studentsData.data.users || []) : []);

    } catch (err) {
      console.error('Fetch data error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tính toán thống kê tổng quan và phân tích học sinh
   * @returns {Object} Object chứa các thống kê đã tính toán
   */
  const calculateStats = () => {
    const completedResults = allResults.filter(r => r.status === 'completed');
    const totalExams = exams.length;
    const totalStudents = students.length;
    const totalResults = completedResults.length;
    
    // Tính điểm trung bình toàn bộ
    const averageScore = totalResults > 0 
      ? Math.round(completedResults.reduce((sum, result) => sum + result.score, 0) / totalResults)
      : 0;

    // Tính thống kê cho từng học sinh
    const studentStats = students.map(student => {
      const studentResults = completedResults.filter(r => r.user?._id === student._id);
      const avgScore = studentResults.length > 0 
        ? Math.round(studentResults.reduce((sum, r) => sum + r.score, 0) / studentResults.length)
        : 0;
      return { ...student, avgScore, completedExams: studentResults.length };
    }).sort((a, b) => b.avgScore - a.avgScore);

    // Top 5 học sinh xuất sắc
    const topStudents = studentStats.slice(0, 5);
    
    // Top 5 học sinh cần hỗ trợ (điểm < 50%)
    const needHelpStudents = studentStats.filter(s => s.avgScore < 50).slice(0, 5);

    return {
      totalExams,
      totalStudents,
      totalResults,
      averageScore,
      topStudents,
      needHelpStudents
    };
  };

  const stats = calculateStats();

  /**
   * Lọc đề thi theo trạng thái
   */
  const filteredExams = exams.filter(exam => {
    if (filterStatus === 'all') return true;
    return exam.status === filterStatus;
  });

  /**
   * Lấy màu sắc CSS cho badge trạng thái đề thi
   * @param {string} status - Trạng thái đề thi
   * @returns {string} CSS classes cho màu sắc
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Chuyển đổi trạng thái đề thi sang tên hiển thị tiếng Việt
   * @param {string} status - Trạng thái đề thi
   * @returns {string} Tên hiển thị tiếng Việt
   */
  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Đã lên lịch';
      case 'draft':
        return 'Bản nháp';
      case 'completed':
        return 'Đã kết thúc';
      default:
        return 'Không xác định';
    }
  };

  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) return <Loading />;
  
  // Hiển thị lỗi nếu có
  if (error) return <Alert type="error" message={error} onClose={() => setError('')} />;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* ==================== HEADER ==================== */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Kết quả Thi</h1>
        <Button variant="secondary" onClick={() => navigate('/teacher/dashboard')}>
          Quay về trang chủ
        </Button>
      </div>

      {/* ==================== OVERALL STATISTICS ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Card tổng số đề thi */}
        <Card className="bg-blue-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">Tổng đề thi</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalExams}</p>
          </div>
        </Card>
        
        {/* Card tổng số học sinh */}
        <Card className="bg-green-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">Tổng học sinh</p>
            <p className="text-2xl font-bold text-green-600">{stats.totalStudents}</p>
          </div>
        </Card>
        
        {/* Card tổng số kết quả thi */}
        <Card className="bg-purple-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">Kết quả thi</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalResults}</p>
          </div>
        </Card>
        
        {/* Card điểm trung bình toàn bộ */}
        <Card className="bg-orange-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">Điểm TB toàn bộ</p>
            <p className="text-2xl font-bold text-orange-600">{stats.averageScore}%</p>
          </div>
        </Card>
      </div>

      {/* ==================== ANALYSIS SECTION ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ==================== TOP STUDENTS ==================== */}
        <div className="lg:col-span-1">
          <Card title="Top 5 Học sinh Xuất sắc">
            <div className="space-y-3">
              {stats.topStudents.map((student, index) => (
                <div key={student._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.completedExams} bài thi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{student.avgScore}%</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ==================== STUDENTS NEED HELP ==================== */}
        <div className="lg:col-span-1">
          <Card title="Học sinh Cần Hỗ trợ">
            <div className="space-y-3">
              {stats.needHelpStudents.map((student, index) => (
                <div key={student._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      !
                    </div>
                  <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.completedExams} bài thi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{student.avgScore}%</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
                        
        {/* ==================== QUICK ACTIONS ==================== */}
        <div className="lg:col-span-1">
          <Card title="Thao tác Nhanh">
            <div className="space-y-3">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => navigate('/teacher/students')}
              >
                👥 Quản lý Học sinh
              </Button>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => navigate('/teacher/exams')}
              >
                📝 Quản lý Đề thi
              </Button>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => window.print()}
              >
                🖨️ In Báo cáo
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* ==================== EXAM LIST ==================== */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Danh sách Đề thi</h2>
          <div className="flex space-x-2">
            {/* Filter dropdown */}
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-md px-3 py-1"
            >
              <option value="all">Tất cả</option>
              <option value="scheduled">Đã lên lịch</option>
              <option value="draft">Bản nháp</option>
              <option value="completed">Đã kết thúc</option>
            </select>
          </div>
        </div>

        <Card>
          {/* Hiển thị khi không có đề thi */}
          {filteredExams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Không có đề thi nào</p>
            </div>
          ) : (
            /* Danh sách đề thi với thống kê */
            <div className="space-y-4">
              {filteredExams.map((exam) => {
                const examResults = allResults.filter(r => r.exam?._id === exam._id);
                const completedResults = examResults.filter(r => r.status === 'completed');
                const averageScore = completedResults.length > 0 
                  ? Math.round(completedResults.reduce((sum, result) => sum + result.score, 0) / completedResults.length)
                  : 0;

                return (
                  <div key={exam._id} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
                    {/* Thông tin đề thi */}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {exam.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <p className="text-sm text-gray-600">
                          Tham gia: {examResults.length} học sinh
                        </p>
                        {completedResults.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Điểm TB: {averageScore}%
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {exam.startTime ? new Date(exam.startTime).toLocaleDateString('vi-VN') : 'Chưa lên lịch'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Trạng thái và link xem kết quả */}
                    <div className="ml-4 flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                        {getStatusText(exam.status)}
                      </span>
                      {examResults.length > 0 && (
                        <Link 
                          to={`/teacher/exams/${exam._id}/results`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Xem kết quả
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ExamResults; 