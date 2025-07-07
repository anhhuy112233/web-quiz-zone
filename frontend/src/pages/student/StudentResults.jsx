/**
 * Component StudentResults - Trang kết quả thi tổng hợp cho học sinh
 * Hiển thị thống kê tổng quan, lịch sử thi và phân tích hiệu suất học tập
 */

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import Alert from "../../components/common/Alert";
import { getAuthHeaders, createApiUrl } from "../../utils/api";

/**
 * StudentResults component
 * @returns {JSX.Element} Trang kết quả thi với thống kê và lịch sử chi tiết
 */
const StudentResults = () => {
  const navigate = useNavigate();
  
  // State quản lý dữ liệu và trạng thái
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(5);

  // Effect để fetch dữ liệu khi component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  /**
   * Fetch tất cả dữ liệu cần thiết cho trang kết quả
   */
  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch kết quả thi của học sinh
      const resultsResponse = await fetch(createApiUrl('/api/results'), {
        headers: getAuthHeaders(),
      });
      const resultsData = await resultsResponse.json();
      setResults(resultsResponse.ok ? resultsData.data.results || [] : []);

      // Fetch danh sách đề thi để so sánh
      const examsResponse = await fetch(createApiUrl('/api/exams'), {
        headers: getAuthHeaders(),
      });
      const examsData = await examsResponse.json();
      setExams(examsResponse.ok ? examsData.data.exams || [] : []);
    } catch (err) {
      console.error("Fetch data error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tính toán thống kê tổng quan của học sinh
   * @returns {Object} Các thống kê bao gồm điểm trung bình, thành tích tốt nhất, xu hướng
   */
  const calculateStats = () => {
    const completedResults = results.filter((r) => r.status === "completed");
    const totalExams = exams.length;
    const completedExams = completedResults.length;

    // Tính điểm trung bình
    const averageScore =
      completedExams > 0
        ? Math.round(
            completedResults.reduce((sum, result) => sum + result.score, 0) /
              completedExams
          )
        : 0;

    // Tìm kết quả tốt nhất và tệ nhất
    const bestResult =
      completedResults.length > 0
        ? completedResults.reduce((best, current) =>
            current.score > best.score ? current : best
          )
        : null;

    const worstResult =
      completedResults.length > 0
        ? completedResults.reduce((worst, current) =>
            current.score < worst.score ? current : worst
          )
        : null;

    // Tính xu hướng hiệu suất gần đây (5 bài thi cuối)
    const recentResults = completedResults
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const recentAverage =
      recentResults.length > 0
        ? Math.round(
            recentResults.reduce((sum, result) => sum + result.score, 0) /
              recentResults.length
          )
        : 0;

    // Tính mức độ cải thiện
    const improvement =
      recentAverage > averageScore ? recentAverage - averageScore : 0;

    return {
      totalExams,
      completedExams,
      averageScore,
      bestResult,
      worstResult,
      recentAverage,
      improvement,
    };
  };

  const stats = calculateStats();

  // Lọc kết quả theo trạng thái
  const filteredResults = results.filter((result) => {
    if (filterStatus === "all") return true;
    return result.status === filterStatus;
  });

  // Logic phân trang
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = filteredResults.slice(startIndex, endIndex);

  // Reset về trang 1 khi thay đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  /**
   * Xử lý thay đổi trang
   * @param {number} page - Số trang muốn chuyển đến
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  /**
   * Tạo danh sách số trang với phân trang thông minh
   * @returns {Array} Mảng các số trang và dấu "..."
   */
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Hiển thị tất cả trang nếu tổng số ít
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Hiển thị phân trang thông minh
      if (currentPage <= 3) {
        // Gần đầu: hiển thị 1,2,3,4,5...cuối
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 5) {
          pages.push("...");
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        // Gần cuối: hiển thị 1...cuối-4,cuối-3,cuối-2,cuối-1,cuối
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Ở giữa: hiển thị 1...hiện tại-1,hiện tại,hiện tại+1...cuối
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  /**
   * Lấy màu sắc CSS cho badge trạng thái
   * @param {string} status - Trạng thái bài thi
   * @returns {string} CSS classes cho màu sắc
   */
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /**
   * Chuyển đổi trạng thái sang tên hiển thị tiếng Việt
   * @param {string} status - Trạng thái bài thi
   * @returns {string} Tên hiển thị tiếng Việt
   */
  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "in_progress":
        return "Đang làm";
      default:
        return "Không xác định";
    }
  };

  /**
   * Lấy màu sắc CSS cho điểm số
   * @param {number} score - Điểm số (0-100)
   * @returns {string} CSS class cho màu sắc
   */
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  /**
   * Lấy emoji tương ứng với điểm số
   * @param {number} score - Điểm số (0-100)
   * @returns {string} Emoji
   */
  const getScoreEmoji = (score) => {
    if (score >= 90) return "🏆";
    if (score >= 80) return "🎉";
    if (score >= 70) return "👍";
    if (score >= 60) return "😊";
    if (score >= 50) return "😐";
    return "😔";
  };

  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Đang tải kết quả..." />
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
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* ==================== HEADER ==================== */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kết quả Thi của Tôi</h1>
        <Button
          variant="secondary"
          onClick={() => navigate("/student/dashboard")}
        >
          Quay về trang chủ
        </Button>
      </div>

      {/* ==================== OVERALL STATISTICS ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card tổng đề thi */}
        <Card className="bg-blue-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">Tổng đề thi</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalExams}
            </p>
          </div>
        </Card>
        
        {/* Card đã hoàn thành */}
        <Card className="bg-green-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">Đã hoàn thành</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.completedExams}
            </p>
          </div>
        </Card>
        
        {/* Card điểm trung bình */}
        <Card className="bg-purple-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">Điểm trung bình</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.averageScore}%
            </p>
          </div>
        </Card>
        
        {/* Card cải thiện gần đây */}
        <Card className="bg-orange-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">Cải thiện gần đây</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.improvement > 0 ? `+${stats.improvement}%` : "0%"}
            </p>
          </div>
        </Card>
      </div>

      {/* ==================== DETAILED ANALYSIS ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thành tích tốt nhất */}
        <div className="lg:col-span-1">
          <Card title="🏆 Thành tích Tốt nhất">
            {stats.bestResult ? (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {stats.bestResult.exam?.title}
                  </h4>
                  <span className="text-2xl">
                    {getScoreEmoji(stats.bestResult.score)}
                  </span>
                </div>
                <p
                  className={`text-2xl font-bold ${getScoreColor(
                    stats.bestResult.score
                  )}`}
                >
                  {stats.bestResult.score}%
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(stats.bestResult.createdAt).toLocaleDateString(
                    "vi-VN"
                  )}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có kết quả nào</p>
              </div>
            )}
          </Card>
        </div>

        {/* Xu hướng gần đây */}
        <div className="lg:col-span-1">
          <Card title="📈 Xu hướng Gần đây">
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-gray-600">Điểm TB 5 bài gần nhất</p>
                <p
                  className={`text-2xl font-bold ${getScoreColor(
                    stats.recentAverage
                  )}`}
                >
                  {stats.recentAverage}%
                </p>
              </div>
              {stats.improvement > 0 && (
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">
                    🎉 Cải thiện {stats.improvement}% so với trung bình!
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Thao tác nhanh */}
        <div className="lg:col-span-1">
          <Card title="Thao tác Nhanh">
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate("/student/exams")}
              >
                📝 Làm bài thi mới
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => window.print()}
              >
                🖨️ In báo cáo
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* ==================== RESULTS LIST ==================== */}
      <div className="mt-8">
        {/* Header danh sách kết quả */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Lịch sử Thi</h2>
            <p className="text-sm text-gray-600 mt-1">
              Trang {currentPage} / {totalPages} • {filteredResults.length} kết
              quả
            </p>
          </div>
          <div className="flex space-x-2">
            {/* Filter dropdown */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-md px-3 py-1"
            >
              <option value="all">Tất cả</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="in_progress">Đang làm</option>
            </select>
          </div>
        </div>

        <Card>
          {/* Hiển thị khi không có kết quả */}
          {filteredResults.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-gray-500">Chưa có kết quả thi nào</p>
            </div>
          ) : (
            <>
              {/* Danh sách kết quả */}
              <div className="space-y-4">
                {currentResults.map((result) => (
                  <div
                    key={result._id}
                    className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0"
                  >
                    {/* Thông tin kết quả */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {result.exam?.title || "Bài thi không xác định"}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            result.status
                          )}`}
                        >
                          {getStatusText(result.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        {/* Hiển thị điểm nếu đã hoàn thành */}
                        {result.status === "completed" && (
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-lg font-bold ${getScoreColor(
                                result.score
                              )}`}
                            >
                              {result.score}%
                            </span>
                            <span className="text-lg">
                              {getScoreEmoji(result.score)}
                            </span>
                          </div>
                        )}
                        <p className="text-sm text-gray-600">
                          {result.totalQuestions} câu hỏi
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(result.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {/* Nút thao tác */}
                    <div className="ml-4">
                      {result.status === "completed" && (
                        <Link
                          to={`/student/exams/${result.exam?._id}/detail-result`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Xem chi tiết
                        </Link>
                      )}
                      {result.status === "in_progress" && (
                        <Link
                          to={`/student/exams/${result.exam?._id}/start`}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Tiếp tục làm
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ==================== PAGINATION ==================== */}
              {totalPages > 1 && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    {/* Thông tin phân trang */}
                    <div className="text-sm text-gray-600">
                      Hiển thị {startIndex + 1}-
                      {Math.min(endIndex, filteredResults.length)} /{" "}
                      {filteredResults.length} kết quả
                    </div>

                    {/* Điều khiển phân trang */}
                    <div className="flex items-center space-x-2">
                      {/* Nút trước */}
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm"
                      >
                        ← Trước
                      </Button>

                      {/* Số trang */}
                      <div className="flex items-center space-x-1">
                        {getPageNumbers().map((page, index) => (
                          <React.Fragment key={index}>
                            {page === "..." ? (
                              <span className="px-2 text-gray-500">...</span>
                            ) : (
                              <Button
                                variant={
                                  currentPage === page ? "primary" : "outline"
                                }
                                onClick={() => handlePageChange(page)}
                                className="px-3 py-1 text-sm min-w-[40px]"
                              >
                                {page}
                              </Button>
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Nút sau */}
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm"
                      >
                        Sau →
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentResults;
