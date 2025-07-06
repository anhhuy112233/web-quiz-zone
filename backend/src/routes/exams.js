// Import Express framework để tạo router
import express from 'express';
// Import multer để xử lý file upload
import multer from 'multer';
// Import các controller xử lý logic exam
import {
  createExam,      // Tạo đề thi mới
  getAllExams,     // Lấy danh sách tất cả đề thi
  getExam,         // Lấy thông tin chi tiết một đề thi
  updateExam,      // Cập nhật đề thi
  deleteExam,      // Xóa đề thi
  startExam,       // Bắt đầu làm bài thi
  submitExam,      // Nộp bài thi
  parseExcelFile   // Parse file Excel để import câu hỏi
} from '../controllers/examController.js';
// Import middleware xác thực và phân quyền
import { protect, restrictTo } from '../middleware/auth.js';

// Tạo router instance
const router = express.Router();

// ==================== MULTER CONFIGURATION ====================

/**
 * Cấu hình multer để xử lý file upload
 * Chỉ chấp nhận file Excel (.xlsx, .xls) và CSV
 */
const upload = multer({
  storage: multer.memoryStorage(),  // Lưu file trong memory thay vì disk
  limits: {
    fileSize: 5 * 1024 * 1024,     // Giới hạn 5MB
  },
  fileFilter: (req, file, cb) => {
    // Kiểm tra loại file được phép upload
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||  // .xlsx
        file.mimetype === 'application/vnd.ms-excel' ||                                           // .xls
        file.mimetype === 'text/csv' ||                                                           // .csv
        file.mimetype === 'application/csv') {                                                    // .csv
      cb(null, true);  // Chấp nhận file
    } else {
      cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV'), false);  // Từ chối file
    }
  }
});

// ==================== EXAM ROUTES ====================

// Bảo vệ tất cả routes - yêu cầu đăng nhập
router.use(protect);

/**
 * Routes cho tất cả users đã đăng nhập
 * Không phân biệt vai trò
 */

// Lấy danh sách tất cả đề thi
router.get('/', getAllExams);

// Lấy thông tin chi tiết một đề thi
router.get('/:id', getExam);

/**
 * Routes chỉ dành cho học sinh (student)
 */

// Bắt đầu làm bài thi
router.post('/:id/start', restrictTo('student'), startExam);

// Nộp bài thi
router.post('/:id/submit', restrictTo('student'), submitExam);

/**
 * Routes chỉ dành cho giáo viên và admin
 */

// Tạo đề thi mới
router.post('/', restrictTo('teacher', 'admin'), createExam);

// Parse file Excel để import câu hỏi
router.post('/parse-excel', restrictTo('teacher', 'admin'), upload.single('file'), parseExcelFile);

// Cập nhật đề thi
router.patch('/:id', restrictTo('teacher', 'admin'), updateExam);

// Xóa đề thi
router.delete('/:id', restrictTo('teacher', 'admin'), deleteExam);

// Export router để sử dụng trong app chính
export default router; 