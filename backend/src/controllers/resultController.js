// Import các model cần thiết
import Result from '../models/Result.js';    // Model Result để tương tác với bảng results
import Exam from '../models/Exam.js';        // Model Exam để lấy thông tin bài thi

/**
 * Lấy danh sách kết quả thi (có phân quyền theo role)
 * GET /api/results
 * - Student: chỉ xem được kết quả của mình
 * - Teacher/Admin: xem được tất cả kết quả
 */
export const getResults = async (req, res) => {
  try {
    const query = {};

    // Nếu user là student, chỉ cho xem kết quả của mình
    if (req.user.role === 'student') {
      query.user = req.user._id || req.user.id;
    }

    // Lọc theo bài thi nếu có
    if (req.query.exam) {
      query.exam = req.query.exam;
    }

    // Lọc theo trạng thái nếu có (in_progress, completed, timeout)
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Tìm kết quả theo query, populate thông tin bài thi và user
    const results = await Result.find(query)
      .populate('exam', 'title duration totalQuestions questions')  // Lấy thông tin bài thi
      .populate('user', 'name email')                              // Lấy thông tin user
      .sort('-createdAt');                                         // Sắp xếp theo thời gian tạo mới nhất

    // Trả về response với danh sách kết quả
    res.status(200).json({
      status: 'success',
      results: results.length,  // Số lượng kết quả
      data: { results }
    });
  } catch (error) {
    // Xử lý lỗi
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Lấy thông tin chi tiết một kết quả thi
 * GET /api/results/:id
 * Kiểm tra quyền truy cập theo role
 */
export const getResult = async (req, res) => {
  try {
    // Tìm kết quả theo ID và populate thông tin liên quan
    const result = await Result.findById(req.params.id)
      .populate('exam', 'title duration totalQuestions questions')
      .populate('user', 'name email');

    // Kiểm tra kết quả có tồn tại không
    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy kết quả bài thi.'
      });
    }

    // Kiểm tra quyền xem kết quả
    // Student chỉ được xem kết quả của mình
    if (req.user.role === 'student' && result.user._id.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền xem kết quả này.'
      });
    }

    // Trả về thông tin kết quả
    res.status(200).json({
      status: 'success',
      data: { result }
    });
  } catch (error) {
    // Xử lý lỗi
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Lấy kết quả của một bài thi cụ thể
 * GET /api/results/exam/:examId
 * Chỉ teacher và admin mới có quyền xem
 */
export const getExamResults = async (req, res) => {
  try {
    // Tìm bài thi theo ID
    const exam = await Exam.findById(req.params.examId);

    // Kiểm tra bài thi có tồn tại không
    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy bài thi.'
      });
    }

    // Kiểm tra quyền xem kết quả bài thi
    // Student không được xem kết quả tổng hợp của bài thi
    if (req.user.role === 'student') {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền xem kết quả bài thi này.'
      });
    }

    // Tìm tất cả kết quả của bài thi này
    const results = await Result.find({ exam: exam._id })
      .populate('user', 'name email')  // Lấy thông tin user
      .populate({
        path: 'exam',
        select: 'title duration totalQuestions questions'  // Lấy thông tin bài thi
      })
      .lean(); // Chuyển sang plain object để dễ xử lý

    // Thêm thông tin câu hỏi vào answers để hiển thị chi tiết
    const processedResults = results.map(result => {
      const processedAnswers = result.answers.map(answer => {
        // Tìm câu hỏi tương ứng trong bài thi
        const question = exam.questions.find(q => q._id.toString() === answer.questionId.toString());
        return {
          ...answer,
          question: question || null  // Thêm thông tin câu hỏi
        };
      });
      return {
        ...result,
        answers: processedAnswers
      };
    });

    // Tính toán thống kê
    const totalStudents = processedResults.length;  // Tổng số học sinh tham gia
    const completedResults = processedResults.filter(r => r.status === 'completed');  // Số học sinh hoàn thành
    const averageScore = completedResults.length > 0
      ? completedResults.reduce((acc, curr) => acc + curr.score, 0) / completedResults.length  // Điểm trung bình
      : 0;

    // Trả về response với thông tin bài thi, thống kê và kết quả
    res.status(200).json({
      status: 'success',
      data: {
        exam: {
          title: exam.title,
          totalQuestions: exam.totalQuestions,
          duration: exam.duration,
          questions: exam.questions
        },
        statistics: {
          totalStudents,
          completedStudents: completedResults.length,
          averageScore: Math.round(averageScore)
        },
        results: processedResults
      }
    });
  } catch (error) {
    // Xử lý lỗi
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Lấy kết quả của một user cụ thể
 * GET /api/results/user/:userId
 * Kiểm tra quyền truy cập theo role
 */
export const getUserResults = async (req, res) => {
  try {
    // Lấy user ID từ params hoặc user hiện tại
    const userId = req.params.userId || req.user._id || req.user.id;

    // Kiểm tra quyền xem kết quả của user khác
    // Student chỉ được xem kết quả của mình
    // Teacher và Admin có thể xem kết quả của tất cả
    if (userId !== (req.user._id || req.user.id) && req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền xem kết quả của người dùng này.'
      });
    }

    // Tìm tất cả kết quả của user
    const results = await Result.find({ user: userId })
      .populate('exam', 'title duration totalQuestions')  // Lấy thông tin bài thi
      .sort('-createdAt');                                // Sắp xếp theo thời gian tạo mới nhất

    // Tính toán thống kê
    const completedResults = results.filter(r => r.status === 'completed');  // Số bài thi đã hoàn thành
    const averageScore = completedResults.length > 0
      ? completedResults.reduce((acc, curr) => acc + curr.score, 0) / completedResults.length  // Điểm trung bình
      : 0;

    // Trả về response với thống kê và danh sách kết quả
    res.status(200).json({
      status: 'success',
      data: {
        statistics: {
          totalExams: results.length,           // Tổng số bài thi đã tham gia
          completedExams: completedResults.length,  // Số bài thi đã hoàn thành
          averageScore: Math.round(averageScore)    // Điểm trung bình
        },
        results
      }
    });
  } catch (error) {
    // Xử lý lỗi
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Xóa kết quả thi
 * DELETE /api/results/:id
 * Chỉ admin và teacher mới có quyền xóa
 */
export const deleteResult = async (req, res) => {
  try {
    // Tìm kết quả theo ID
    const result = await Result.findById(req.params.id);

    // Kiểm tra kết quả có tồn tại không
    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy kết quả bài thi.'
      });
    }

    // Kiểm tra quyền xóa
    // Student không được xóa kết quả của người khác
    if (req.user.role === 'student' && result.user.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền xóa kết quả này.'
      });
    }

    // Xóa kết quả
    await Result.findByIdAndDelete(req.params.id);

    // Trả về response thành công
    res.status(200).json({
      status: 'success',
      message: 'Đã xóa kết quả bài thi thành công.'
    });
  } catch (error) {
    // Xử lý lỗi
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 