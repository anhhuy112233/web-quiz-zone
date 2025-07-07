// Import các model và thư viện cần thiết
import Exam from '../models/Exam.js';        // Model Exam để tương tác với bảng exams
import Result from '../models/Result.js';    // Model Result để lấy kết quả thi
import User from '../models/User.js';        // Model User để lấy thông tin user
import XLSX from 'xlsx';                     // Thư viện xử lý file Excel

/**
 * Tạo bài thi mới
 * POST /api/exams
 * Chỉ teacher và admin mới có quyền tạo bài thi
 */
export const createExam = async (req, res) => {
  try {
    // Ép kiểu Date cho startTime và endTime để tránh lỗi lệch múi giờ
    const body = { ...req.body };
    if (body.startTime) body.startTime = new Date(body.startTime);
    if (body.endTime) body.endTime = new Date(body.endTime);
    // Tạo bài thi mới với thông tin từ request body
    // Tự động gán createdBy là user hiện tại
    const exam = await Exam.create({
      ...body,
      createdBy: req.user._id || req.user.id
    });
    // Trả về response thành công với dữ liệu bài thi
    res.status(201).json({
      status: 'success',
      data: { exam }
    });
  } catch (error) {
    // Xử lý lỗi validation hoặc database
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Lấy danh sách tất cả bài thi (có phân quyền theo role)
 * GET /api/exams
 * - Student: chỉ xem được bài thi public hoặc scheduled
 * - Teacher/Admin: xem được tất cả bài thi
 */
export const getAllExams = async (req, res) => {
  try {
    const query = {};

    // Lọc theo trạng thái nếu có (draft, scheduled, active, completed)
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Lọc theo khoảng thời gian nếu có
    if (req.query.startDate && req.query.endDate) {
      query.startTime = {
        $gte: new Date(req.query.startDate),  // Greater than or equal
        $lte: new Date(req.query.endDate)     // Less than or equal
      };
    }

    // Nếu user là student, chỉ cho xem bài thi public hoặc scheduled
    if (req.user.role === 'student') {
      query.$or = [
        { isPublic: true },      // Bài thi công khai
        { status: 'scheduled' }  // Bài thi đã lên lịch
      ];
    }

    // Tìm bài thi theo query, populate thông tin người tạo
    const exams = await Exam.find(query)
      .populate('createdBy', 'name email')  // Lấy thông tin người tạo
      .sort('-createdAt');                  // Sắp xếp theo thời gian tạo mới nhất

    // Trả về response với danh sách bài thi
    res.status(200).json({
      status: 'success',
      results: exams.length,  // Số lượng bài thi
      data: { exams }
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
 * Lấy thông tin chi tiết một bài thi
 * GET /api/exams/:id
 * Kiểm tra quyền truy cập theo role
 */
export const getExam = async (req, res) => {
  try {
    // Tìm bài thi theo ID và populate thông tin người tạo
    const exam = await Exam.findById(req.params.id)
      .populate('createdBy', 'name email');

    // Kiểm tra bài thi có tồn tại không
    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy bài thi.'
      });
    }

    // Nếu user là student, kiểm tra quyền truy cập
    if (req.user.role === 'student') {
      // Chỉ cho phép truy cập bài thi public hoặc scheduled
      if (!exam.isPublic && exam.status !== 'scheduled') {
        return res.status(403).json({
          status: 'error',
          message: 'Bạn không có quyền truy cập bài thi này.'
        });
      }
    }

    // Trả về thông tin bài thi
    res.status(200).json({
      status: 'success',
      data: { exam }
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
 * Cập nhật thông tin bài thi
 * PATCH /api/exams/:id
 * Chỉ người tạo hoặc admin mới có quyền cập nhật
 */
export const updateExam = async (req, res) => {
  try {
    // Tìm bài thi theo ID
    const exam = await Exam.findById(req.params.id);
    // Kiểm tra bài thi có tồn tại không
    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy bài thi.'
      });
    }
    // Kiểm tra quyền cập nhật: chỉ người tạo hoặc admin
    if (exam.createdBy.toString() !== (req.user._id || req.user.id).toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền cập nhật bài thi này.'
      });
    }
    // Không cho phép cập nhật nếu bài thi đang diễn ra hoặc đã kết thúc
    if (exam.status === 'active' || exam.status === 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Không thể cập nhật bài thi đang diễn ra hoặc đã kết thúc.'
      });
    }
    // Ép kiểu Date cho startTime và endTime để tránh lỗi lệch múi giờ
    const body = { ...req.body };
    if (body.startTime) body.startTime = new Date(body.startTime);
    if (body.endTime) body.endTime = new Date(body.endTime);
    // Cập nhật bài thi với dữ liệu mới
    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      body,
      {
        new: true,           // Trả về document đã được cập nhật
        runValidators: true  // Chạy validation của mongoose
      }
    );
    // Trả về response thành công
    res.status(200).json({
      status: 'success',
      data: { exam: updatedExam }
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
 * Xóa bài thi
 * DELETE /api/exams/:id
 * Chỉ người tạo hoặc admin mới có quyền xóa
 */
export const deleteExam = async (req, res) => {
  try {
    // Tìm bài thi theo ID
    const exam = await Exam.findById(req.params.id);

    // Kiểm tra bài thi có tồn tại không
    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy bài thi.'
      });
    }

    // Kiểm tra quyền xóa: chỉ người tạo hoặc admin
    if (exam.createdBy.toString() !== (req.user._id || req.user.id).toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền xóa bài thi này.'
      });
    }

    // Không cho phép xóa nếu bài thi đang diễn ra hoặc đã kết thúc
    if (exam.status === 'active' || exam.status === 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Không thể xóa bài thi đang diễn ra hoặc đã kết thúc.'
      });
    }

    // Xóa bài thi
    await exam.deleteOne();

    // Trả về response thành công (không có dữ liệu)
    res.status(204).json({
      status: 'success',
      data: null
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
 * Bắt đầu làm bài thi
 * POST /api/exams/:id/start
 * Chỉ student mới có quyền bắt đầu làm bài
 */
export const startExam = async (req, res) => {
  try {
    // Tìm bài thi theo ID
    const exam = await Exam.findById(req.params.id);

    // Kiểm tra bài thi có tồn tại không
    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy bài thi.'
      });
    }

    // Kiểm tra bài thi đã được lên lịch chưa
    if (exam.status !== 'scheduled') {
      return res.status(400).json({
        status: 'error',
        message: 'Bài thi chưa được lên lịch.'
      });
    }

    // Kiểm tra bài thi đã bắt đầu chưa
    if (new Date() < exam.startTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Bài thi chưa bắt đầu.'
      });
    }

    // Kiểm tra bài thi đã kết thúc chưa
    if (new Date() > exam.endTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Bài thi đã kết thúc.'
      });
    }

    // Xóa các result in_progress cũ trước khi tạo mới
    await Result.deleteMany({
      exam: exam._id,
      user: req.user._id || req.user.id,
      status: 'in_progress'
    });

    // Tạo result mới cho lần làm bài này
    const result = await Result.create({
      exam: exam._id,
      user: req.user._id || req.user.id,
      startTime: new Date(),
      endTime: new Date(Date.now() + exam.duration * 60000), // Thời gian kết thúc = hiện tại + duration (phút)
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

/**
 * Nộp bài thi
 * POST /api/exams/:id/submit
 * Chỉ student mới có quyền nộp bài
 */
export const submitExam = async (req, res) => {
  try {
    const { answers } = req.body;
    
    // Tìm bài thi theo ID
    const exam = await Exam.findById(req.params.id);

    // Kiểm tra bài thi có tồn tại không
    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy bài thi.'
      });
    }

    // Tìm result đang làm bài (lấy lần làm bài mới nhất)
    const result = await Result.findOne({
      exam: exam._id,
      user: req.user._id || req.user.id,
      status: 'in_progress'
    }).sort({ createdAt: -1 });

    // Kiểm tra có đang làm bài không
    if (!result) {
      return res.status(400).json({
        status: 'error',
        message: 'Bạn chưa bắt đầu bài thi này.'
      });
    }

    // Tính điểm và xử lý câu trả lời
    let correctAnswers = 0;
    const processedAnswers = answers.map(answer => {
      // Tìm câu hỏi tương ứng trong bài thi
      const question = exam.questions.find(q => q._id.toString() === answer.questionId.toString());
      
      // Xử lý trường hợp chưa chọn đáp án (selectedAnswer = -1)
      const hasAnswered = answer.selectedAnswer !== -1 && answer.selectedAnswer !== null;
      const isCorrect = hasAnswered && question && question.correctAnswer === answer.selectedAnswer;
      
      if (isCorrect) correctAnswers++;
      
      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        hasAnswered
      };
    });

    // Cập nhật result với kết quả
    result.answers = processedAnswers;
    result.correctAnswers = correctAnswers;
    result.totalQuestions = exam.questions.length; // Lưu tổng số câu hỏi
    result.score = Math.round((correctAnswers / result.totalQuestions) * 100); // Tính điểm phần trăm
    result.status = 'completed';
    result.endTime = new Date();
    result.duration = Math.round((result.endTime - result.startTime) / 60000); // Thời gian làm bài tính bằng phút
    await result.save();
    
    // Xóa các result in_progress còn lại (nếu có)
    await Result.deleteMany({
      exam: exam._id,
      user: req.user._id || req.user.id,
      status: 'in_progress',
      _id: { $ne: result._id }
    });

    // Trả về kết quả
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
 * Parse file Excel/CSV và trả về danh sách câu hỏi
 * POST /api/exams/parse-excel
 * Hỗ trợ import câu hỏi từ file Excel hoặc CSV
 */
export const parseExcelFile = async (req, res) => {
  try {
    // Kiểm tra có file được upload không
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

    // Lấy sheet đầu tiên
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Đọc dữ liệu với options để xử lý encoding
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      raw: false,
      defval: ''
    });

    // Validate header - kiểm tra cấu trúc file
    const expectedHeaders = ['Câu hỏi', 'Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D', 'Đáp án đúng', 'Giải thích'];
    const headers = data[0];
    
    if (!headers || headers.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'File không đúng định dạng. Vui lòng kiểm tra cấu trúc file.'
      });
    }

    // Parse câu hỏi từ dữ liệu
    const questions = [];
    const errors = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      try {
        // Tạo object câu hỏi từ dữ liệu
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

        // Validate câu hỏi - kiểm tra dữ liệu bắt buộc
        if (!question.question) {
          errors.push(`Dòng ${i + 1}: Thiếu câu hỏi`);
          continue;
        }

        // Kiểm tra tất cả lựa chọn phải có
        if (question.options.some(opt => !opt)) {
          errors.push(`Dòng ${i + 1}: Thiếu lựa chọn`);
          continue;
        }

        // Parse đáp án đúng từ dữ liệu
        const correctAnswerStr = (row[5] || '').toString().trim().toUpperCase();
        if (correctAnswerStr === 'A' || correctAnswerStr === '1') {
          question.correctAnswer = 0;  // Đáp án A (index 0)
        } else if (correctAnswerStr === 'B' || correctAnswerStr === '2') {
          question.correctAnswer = 1;  // Đáp án B (index 1)
        } else if (correctAnswerStr === 'C' || correctAnswerStr === '3') {
          question.correctAnswer = 2;  // Đáp án C (index 2)
        } else if (correctAnswerStr === 'D' || correctAnswerStr === '4') {
          question.correctAnswer = 3;  // Đáp án D (index 3)
        } else {
          errors.push(`Dòng ${i + 1}: Đáp án đúng không hợp lệ (A/B/C/D hoặc 1/2/3/4)`);
          continue;
        }

        // Thêm câu hỏi vào danh sách nếu hợp lệ
        questions.push(question);
      } catch (error) {
        // Xử lý lỗi khi parse dữ liệu
        errors.push(`Dòng ${i + 1}: Lỗi xử lý dữ liệu`);
      }
    }

    // Kiểm tra có câu hỏi hợp lệ nào không
    if (questions.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Không tìm thấy câu hỏi hợp lệ trong file'
      });
    }

    // Trả về danh sách câu hỏi đã parse
    res.status(200).json({
      status: 'success',
      data: {
        questions,                    // Danh sách câu hỏi
        totalQuestions: questions.length,  // Tổng số câu hỏi
        errors: errors.length > 0 ? errors : null  // Danh sách lỗi (nếu có)
      }
    });

  } catch (error) {
    // Log lỗi để debug
    console.error('Parse Excel error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi xử lý file Excel/CSV'
    });
  }
}; 