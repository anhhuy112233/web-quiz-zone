// Import Express framework để tạo router
import express from 'express';
// Import các controller xử lý logic kết quả bài thi
import {
  getResults,            // Lấy danh sách kết quả
  getResult,             // Lấy thông tin chi tiết một kết quả
  getExamResults,        // Lấy kết quả của một đề thi cụ thể
  getActiveExamStudents, // Lấy danh sách học sinh đang thi (cho giám sát)
  getUserResults,        // Lấy kết quả của một user cụ thể
  deleteResult           // Xóa kết quả
} from '../controllers/resultController.js';
// Import middleware xác thực và phân quyền
import { protect, restrictTo } from '../middleware/auth.js';

// Tạo router instance
const router = express.Router();

// ==================== RESULT ROUTES ====================

// Bảo vệ tất cả routes - yêu cầu đăng nhập
router.use(protect);

/**
 * Routes cho tất cả users đã đăng nhập
 * Không phân biệt vai trò
 */

// Lấy danh sách kết quả (có thể lọc theo user hiện tại)
router.get('/', getResults);

// Lấy thông tin chi tiết một kết quả theo ID
router.get('/:id', getResult);

/**
 * Routes chỉ dành cho giáo viên và admin
 */

// Lấy danh sách học sinh đang thi (cho giám sát real-time)
router.get('/exam/:examId/active', restrictTo('teacher', 'admin'), getActiveExamStudents);

// Lấy tất cả kết quả của một đề thi cụ thể
router.get('/exam/:examId', restrictTo('teacher', 'admin'), getExamResults);

// Lấy tất cả kết quả của một user cụ thể
router.get('/user/:userId', getUserResults);

// Xóa kết quả (có thể dành cho admin hoặc user sở hữu)
router.delete('/:id', deleteResult);

// Export router để sử dụng trong app chính
export default router; 