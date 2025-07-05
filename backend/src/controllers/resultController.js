import Result from '../models/Result.js';
import Exam from '../models/Exam.js';

export const getResults = async (req, res) => {
  try {
    const query = {};

    // If user is student, only show their results
    if (req.user.role === 'student') {
      query.user = req.user._id || req.user.id;
    }

    // Filter by exam if provided
    if (req.query.exam) {
      query.exam = req.query.exam;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const results = await Result.find(query)
      .populate('exam', 'title duration totalQuestions questions')
      .populate('user', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: results.length,
      data: { results }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('exam', 'title duration totalQuestions questions')
      .populate('user', 'name email');

    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy kết quả bài thi.'
      });
    }

    // Check if user has permission to view this result
    if (req.user.role === 'student' && result.user._id.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền xem kết quả này.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { result }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getExamResults = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy bài thi.'
      });
    }

    // Check if user has permission to view exam results
    if (req.user.role === 'student') {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền xem kết quả bài thi này.'
      });
    }

    const results = await Result.find({ exam: exam._id })
      .populate('user', 'name email')
      .populate({
        path: 'exam',
        select: 'title duration totalQuestions questions'
      })
      .lean(); // Chuyển sang plain object để dễ xử lý

    // Thêm thông tin câu hỏi vào answers
    const processedResults = results.map(result => {
      const processedAnswers = result.answers.map(answer => {
        const question = exam.questions.find(q => q._id.toString() === answer.questionId.toString());
        return {
          ...answer,
          question: question || null
        };
      });
      return {
        ...result,
        answers: processedAnswers
      };
    });

    // Calculate statistics
    const totalStudents = processedResults.length;
    const completedResults = processedResults.filter(r => r.status === 'completed');
    const averageScore = completedResults.length > 0
      ? completedResults.reduce((acc, curr) => acc + curr.score, 0) / completedResults.length
      : 0;

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
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getUserResults = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id || req.user.id;

    // Check if user has permission to view other user's results
    if (userId !== (req.user._id || req.user.id) && req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền xem kết quả của người dùng này.'
      });
    }

    const results = await Result.find({ user: userId })
      .populate('exam', 'title duration totalQuestions')
      .sort('-createdAt');

    // Calculate statistics
    const completedResults = results.filter(r => r.status === 'completed');
    const averageScore = completedResults.length > 0
      ? completedResults.reduce((acc, curr) => acc + curr.score, 0) / completedResults.length
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        statistics: {
          totalExams: results.length,
          completedExams: completedResults.length,
          averageScore: Math.round(averageScore)
        },
        results
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const deleteResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy kết quả bài thi.'
      });
    }

    // Kiểm tra quyền xóa
    if (req.user.role === 'student' && result.user.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền xóa kết quả này.'
      });
    }

    await Result.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Đã xóa kết quả bài thi thành công.'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 