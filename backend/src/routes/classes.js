// Import Express framework để tạo router
import express from 'express';
// Import các controller xử lý logic class
import {
  getAllClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass
} from '../controllers/classController.js';
// Import middleware xác thực và phân quyền
import { protect, restrictTo } from '../middleware/auth.js';

// Tạo router instance
const router = express.Router();

// ==================== CLASS ROUTES ====================

// Bảo vệ tất cả routes - yêu cầu đăng nhập
router.use(protect);

/**
 * Routes cho tất cả users đã đăng nhập
 */

// Lấy danh sách tất cả lớp học
router.get('/', getAllClasses);

// Lấy thông tin chi tiết một lớp học
router.get('/:id', getClass);

/**
 * Routes chỉ dành cho admin
 */

// Tạo lớp học mới
router.post('/', restrictTo('admin'), createClass);

// Cập nhật lớp học
router.patch('/:id', restrictTo('admin'), updateClass);

// Xóa lớp học
router.delete('/:id', restrictTo('admin'), deleteClass);

// Thêm sinh viên vào lớp
router.post('/:id/students', restrictTo('admin'), addStudentToClass);

// Xóa sinh viên khỏi lớp
router.delete('/:id/students/:studentId', restrictTo('admin'), removeStudentFromClass);

// Export router để sử dụng trong app chính
export default router;


