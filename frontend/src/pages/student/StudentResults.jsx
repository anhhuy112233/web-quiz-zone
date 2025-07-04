import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import Alert from "../../components/common/Alert";
import { getAuthHeaders } from "../../utils/api";

const StudentResults = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(5);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch student's results
      const resultsResponse = await fetch("http://localhost:5000/api/results", {
        headers: getAuthHeaders(),
      });
      const resultsData = await resultsResponse.json();
      setResults(resultsResponse.ok ? resultsData.data.results || [] : []);

      // Fetch available exams for comparison
      const examsResponse = await fetch("http://localhost:5000/api/exams", {
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

  // Calculate student statistics
  const calculateStats = () => {
    const completedResults = results.filter((r) => r.status === "completed");
    const totalExams = exams.length;
    const completedExams = completedResults.length;

    const averageScore =
      completedExams > 0
        ? Math.round(
            completedResults.reduce((sum, result) => sum + result.score, 0) /
              completedExams
          )
        : 0;

    // Best and worst scores
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

    // Recent performance trend (last 5 exams)
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

    // Performance improvement
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

  // Filter results by status
  const filteredResults = results.filter((result) => {
    if (filterStatus === "all") return true;
    return result.status === filterStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = filteredResults.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination
      if (currentPage <= 3) {
        // Near start: show 1,2,3,4,5...last
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 5) {
          pages.push("...");
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        // Near end: show 1...last-4,last-3,last-2,last-1,last
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle: show 1...current-1,current,current+1...last
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

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreEmoji = (score) => {
    if (score >= 90) return "🏆";
    if (score >= 80) return "🎉";
    if (score >= 70) return "👍";
    if (score >= 60) return "😊";
    if (score >= 50) return "😐";
    return "😔";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Đang tải kết quả..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kết quả Thi của Tôi</h1>
        <Button
          variant="secondary"
          onClick={() => navigate("/student/dashboard")}
        >
          Quay về trang chủ
        </Button>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-blue-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">Tổng đề thi</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalExams}
            </p>
          </div>
        </Card>
        <Card className="bg-green-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">Đã hoàn thành</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.completedExams}
            </p>
          </div>
        </Card>
        <Card className="bg-purple-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">Điểm trung bình</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.averageScore}%
            </p>
          </div>
        </Card>
        <Card className="bg-orange-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">Cải thiện gần đây</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.improvement > 0 ? `+${stats.improvement}%` : "0%"}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best Performance */}
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

        {/* Recent Performance */}
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

        {/* Quick Actions */}
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

      {/* Results List */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Lịch sử Thi</h2>
            <p className="text-sm text-gray-600 mt-1">
              Trang {currentPage} / {totalPages} • {filteredResults.length} kết
              quả
            </p>
          </div>
          <div className="flex space-x-2">
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
          {filteredResults.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-gray-500">Chưa có kết quả thi nào</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {currentResults.map((result) => (
                  <div
                    key={result._id}
                    className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0"
                  >
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    {/* Info */}
                    <div className="text-sm text-gray-600">
                      Hiển thị {startIndex + 1}-
                      {Math.min(endIndex, filteredResults.length)} /{" "}
                      {filteredResults.length} kết quả
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm"
                      >
                        ← Trước
                      </Button>

                      {/* Page Numbers */}
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

                      {/* Next Button */}
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
