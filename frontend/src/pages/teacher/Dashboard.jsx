/**
 * Component TeacherDashboard - Trang dashboard chính cho giáo viên
 * Hiển thị tổng quan về hoạt động giảng dạy, thống kê và các thao tác nhanh
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import Alert from "../../components/common/Alert";
import { getAuthHeaders, createApiUrl } from "../../utils/api";

/**
 * TeacherDashboard component
 * @param {Object} user - Thông tin người dùng hiện tại
 * @returns {JSX.Element} Trang dashboard với thống kê và quick actions
 */
const TeacherDashboard = ({ user }) => {
  // State quản lý thống kê và dữ liệu
  const [stats, setStats] = useState({
    totalExams: 0,      // Tổng số đề thi
    activeExams: 0,     // Số đề thi đang hoạt động
    totalStudents: 0,   // Tổng số học sinh
    totalResults: 0,    // Tổng số kết quả thi
  });

  const [recentExams, setRecentExams] = useState([]); // Danh sách đề thi gần đây
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Effect để fetch dữ liệu dashboard khi component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Fetch tất cả dữ liệu cần thiết cho dashboard
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // ==================== FETCH EXAMS DATA ====================
      
      // Lấy danh sách đề thi của giáo viên
      const examsResponse = await fetch(createApiUrl('/api/exams'), {
        headers: getAuthHeaders(),
      });

      const examsData = await examsResponse.json();
      const exams = examsResponse.ok ? examsData.data.exams || [] : [];

      // ==================== FETCH RESULTS DATA ====================
      
      // Lấy danh sách kết quả thi
      const resultsResponse = await fetch(createApiUrl('/api/results'), {
        headers: getAuthHeaders(),
      });

      const resultsData = await resultsResponse.json();
      const results = resultsResponse.ok ? resultsData.data.results || [] : [];

      // ==================== FETCH STUDENTS DATA ====================
      
      // Lấy danh sách học sinh
      const studentsResponse = await fetch(
        createApiUrl('/api/users?role=student'),
        {
          headers: getAuthHeaders(),
        }
      );

      const studentsData = await studentsResponse.json();
      const students = studentsResponse.ok ? studentsData.data.users || [] : [];

      // ==================== CALCULATE STATISTICS ====================
      
      // Tính toán các thống kê
      const totalExams = exams.length;
      const activeExams = exams.filter(
        (exam) => exam.status === "scheduled"
      ).length;
      const totalResults = results.length;
      const totalStudents = students.length;

      setStats({
        totalExams,
        activeExams,
        totalResults,
        totalStudents,
      });

      // ==================== PREPARE RECENT EXAMS ====================
      
      // Chuẩn bị dữ liệu đề thi gần đây (5 đề thi đầu tiên)
      const recentExams = exams.slice(0, 5).map((exam) => ({
        id: exam._id,
        title: exam.title,
        status: exam.status,
        startTime: new Date(exam.startTime).toLocaleDateString("vi-VN"),
        participantCount: results.filter((result) => result.exam === exam._id)
          .length,
      }));

      setRecentExams(recentExams);
    } catch (err) {
      console.error("Fetch dashboard data error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lấy màu sắc CSS cho badge trạng thái đề thi
   * @param {string} status - Trạng thái đề thi
   * @returns {string} CSS classes cho màu sắc
   */
  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /**
   * Chuyển đổi trạng thái đề thi sang tên hiển thị tiếng Việt
   * @param {string} status - Trạng thái đề thi
   * @returns {string} Tên hiển thị tiếng Việt
   */
  const getStatusText = (status) => {
    switch (status) {
      case "scheduled":
        return "Đã lên lịch";
      case "draft":
        return "Bản nháp";
      case "completed":
        return "Đã kết thúc";
      default:
        return "Không xác định";
    }
  };

  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Đang tải dữ liệu..." />
      </div>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ==================== HEADER ==================== */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Giáo viên
          </h1>
          <p className="mt-2 text-gray-600">
            Chào mừng {user?.name}, đây là tổng quan giảng dạy của bạn
          </p>
        </div>

        {/* ==================== STATISTICS GRID ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card tổng số đề thi */}
          <Card className="bg-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-lg">📝</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng đề thi</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalExams}
                </p>
              </div>
            </div>
          </Card>

          {/* Card đề thi đang hoạt động */}
          <Card className="bg-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-lg">⏰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Đang hoạt động
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.activeExams}
                </p>
              </div>
            </div>
          </Card>

          {/* Card tổng số học sinh */}
          <Card className="bg-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-lg">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Học sinh</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalStudents}
                </p>
              </div>
            </div>
          </Card>

          {/* Card tổng số kết quả thi */}
          <Card className="bg-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-lg">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Kết quả thi</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalResults}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ==================== QUICK ACTIONS ==================== */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Card tạo đề thi */}
            <Link to="/teacher/create-exam" className="block group">
              <Card className="bg-white hover:shadow-lg transition-shadow duration-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-2xl text-white">➕</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tạo đề thi
                  </h3>
                  <p className="text-sm text-gray-600">Tạo đề thi mới</p>
                </div>
              </Card>
            </Link>

            {/* Card quản lý đề thi */}
            <Link to="/teacher/exams" className="block group">
              <Card className="bg-white hover:shadow-lg transition-shadow duration-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-2xl text-white">📝</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Quản lý đề thi
                  </h3>
                  <p className="text-sm text-gray-600">
                    Xem và chỉnh sửa đề thi
                  </p>
                </div>
              </Card>
            </Link>

            {/* Card xem kết quả */}
            <Link to="/teacher/results" className="block group">
              <Card className="bg-white hover:shadow-lg transition-shadow duration-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-2xl text-white">📊</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Xem kết quả
                  </h3>
                  <p className="text-sm text-gray-600">
                    Xem kết quả thi của học sinh
                  </p>
                </div>
              </Card>
            </Link>

            {/* Card quản lý học sinh */}
            <Link to="/teacher/students" className="block group">
              <Card className="bg-white hover:shadow-lg transition-shadow duration-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-2xl text-white">👥</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Quản lý học sinh
                  </h3>
                  <p className="text-sm text-gray-600">
                    Xem danh sách học sinh
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* ==================== RECENT EXAMS ==================== */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Đề thi gần đây
          </h2>
          <Card className="bg-white">
            {/* Hiển thị khi chưa có đề thi */}
            {recentExams.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có đề thi nào</p>
              </div>
            ) : (
              /* Danh sách đề thi gần đây */
              <div className="space-y-4">
                {recentExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
                  >
                    {/* Thông tin đề thi */}
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {exam.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-600">
                          Tham gia: {exam.participantCount} học sinh
                        </p>
                        {exam.startTime && (
                          <p className="text-xs text-gray-500">
                            Bắt đầu: {exam.startTime}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Trạng thái và link chi tiết */}
                    <div className="ml-4 flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          exam.status
                        )}`}
                      >
                        {getStatusText(exam.status)}
                      </span>
                      <Link
                        to={`/teacher/exams/${exam.id}/results`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
