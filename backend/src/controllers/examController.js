import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import User from '../models/User.js';
import XLSX from 'xlsx';

export const createExam = async (req, res) => {
  try {
    const exam = await Exam.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: { exam }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getAllExams = async (req, res) => {
  try {
    const query = {};

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.startTime = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // If user is student, only show public or scheduled exams
    if (req.user.role === 'student') {
      query.$or = [
        { isPublic: true },
        { status: 'scheduled' }
      ];
    }

    const exams = await Exam.find(query)
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: exams.length,
      data: { exams }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy bài thi.'
      });
    }

    // If user is student, check if they can access the exam
    if (req.user.role === 'student') {
      if (!exam.isPublic && exam.status !== 'scheduled') {
        return res.status(403).json({
          status: 'error',
          message: 'Bạn không có quyền truy cập bài thi này.'
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: { exam }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy bài thi.'
      });
    }

    // Check if user is the creator or admin
    if (exam.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền cập nhật bài thi này.'
      });
    }

    // Don't allow updating if exam is active or completed
    if (exam.status === 'active' || exam.status === 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Không thể cập nhật bài thi đang diễn ra hoặc đã kết thúc.'
      });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      data: { exam: updatedExam }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy bài thi.'
      });
    }

    // Check if user is the creator or admin
    if (exam.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền xóa bài thi này.'
      });
    }

    // Don't allow deleting if exam is active or completed
    if (exam.status === 'active' || exam.status === 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Không thể xóa bài thi đang diễn ra hoặc đã kết thúc.'
      });
    }

    await exam.deleteOne();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const startExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy bài thi.'
      });
    }

    // Check if exam is scheduled
    if (exam.status !== 'scheduled') {
      return res.status(400).json({
        status: 'error',
        message: 'Bài thi chưa được lên lịch.'
      });
    }

    // Check if exam has started
    if (new Date() < exam.startTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Bài thi chưa bắt đầu.'
      });
    }

    // Check if exam has ended
    if (new Date() > exam.endTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Bài thi đã kết thúc.'
      });
    }

    // Xóa các result in_progress cũ trước khi tạo mới
    await Result.deleteMany({
      exam: exam._id,
      user: req.user.id,
      status: 'in_progress'
    });

    // Create new result
    const result = await Result.create({
      exam: exam._id,
      user: req.user.id,
      startTime: new Date(),
      endTime: new Date(Date.now() + exam.duration * 60000),
      duration: exam.duration,
      totalQuestions: exam.totalQuestions,
      status: 'in_progress',
      score: 0,
      correctAnswers: 0
    });
    // Lấy object exam đầy đủ để trả về cho frontend
    const examObj = await Exam.findById(exam._id);
    res.status(200).json({
      status: 'success',
      data: { result: { ...result.toObject(), exam: examObj } }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const submitExam = async (req, res) => {
  try {
    const { answers } = req.body;
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy bài thi.'
      });
    }

    // Find the result (lấy lần làm bài mới nhất)
    const result = await Result.findOne({
      exam: exam._id,
      user: req.user.id,
      status: 'in_progress'
    }).sort({ createdAt: -1 });

    if (!result) {
      return res.status(400).json({
        status: 'error',
        message: 'Bạn chưa bắt đầu bài thi này.'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const processedAnswers = answers.map(answer => {
      const question = exam.questions.find(q => q._id.toString() === answer.questionId.toString());
      const isCorrect = question && question.correctAnswer === answer.selectedAnswer;
      if (isCorrect) correctAnswers++;
      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      };
    });

    // Update result
    result.answers = processedAnswers;
    result.correctAnswers = correctAnswers;
    result.score = correctAnswers;
    result.status = 'completed';
    result.endTime = new Date();
    await result.save();
    // Xóa các result in_progress còn lại (nếu có)
    await Result.deleteMany({
      exam: exam._id,
      user: req.user.id,
      status: 'in_progress',
      _id: { $ne: result._id }
    });

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

// Parse Excel/CSV file and return questions
export const parseExcelFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Vui lòng upload file Excel/CSV'
      });
    }

    // Xử lý encoding cho file CSV
    let workbook;
    if (req.file.mimetype === 'text/csv') {
      // Đọc file CSV với encoding UTF-8
      const csvContent = req.file.buffer.toString('utf8');
      workbook = XLSX.read(csvContent, { 
        type: 'string',
        raw: false,
        codepage: 65001 // UTF-8
      });
    } else {
      // Đọc file Excel
      workbook = XLSX.read(req.file.buffer, { 
        type: 'buffer',
        cellText: false,
        cellDates: false
      });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Đọc dữ liệu với options để xử lý encoding
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      raw: false,
      defval: ''
    });

    // Validate header
    const expectedHeaders = ['Câu hỏi', 'Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D', 'Đáp án đúng', 'Giải thích'];
    const headers = data[0];
    
    if (!headers || headers.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'File không đúng định dạng. Vui lòng kiểm tra cấu trúc file.'
      });
    }

    // Parse questions
    const questions = [];
    const errors = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      try {
        const question = {
          question: (row[0] || '').toString().trim(),
          options: [
            (row[1] || '').toString().trim(),
            (row[2] || '').toString().trim(),
            (row[3] || '').toString().trim(),
            (row[4] || '').toString().trim()
          ],
          correctAnswer: 0,
          explanation: (row[6] || '').toString().trim()
        };

        // Validate question
        if (!question.question) {
          errors.push(`Dòng ${i + 1}: Thiếu câu hỏi`);
          continue;
        }

        if (question.options.some(opt => !opt)) {
          errors.push(`Dòng ${i + 1}: Thiếu lựa chọn`);
          continue;
        }

        // Parse correct answer
        const correctAnswerStr = (row[5] || '').toString().trim().toUpperCase();
        if (correctAnswerStr === 'A' || correctAnswerStr === '1') {
          question.correctAnswer = 0;
        } else if (correctAnswerStr === 'B' || correctAnswerStr === '2') {
          question.correctAnswer = 1;
        } else if (correctAnswerStr === 'C' || correctAnswerStr === '3') {
          question.correctAnswer = 2;
        } else if (correctAnswerStr === 'D' || correctAnswerStr === '4') {
          question.correctAnswer = 3;
        } else {
          errors.push(`Dòng ${i + 1}: Đáp án đúng không hợp lệ (A/B/C/D hoặc 1/2/3/4)`);
          continue;
        }

        questions.push(question);
      } catch (error) {
        errors.push(`Dòng ${i + 1}: Lỗi xử lý dữ liệu`);
      }
    }

    if (questions.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Không tìm thấy câu hỏi hợp lệ trong file'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        questions,
        totalQuestions: questions.length,
        errors: errors.length > 0 ? errors : null
      }
    });

  } catch (error) {
    console.error('Parse Excel error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi xử lý file Excel/CSV'
    });
  }
}; 