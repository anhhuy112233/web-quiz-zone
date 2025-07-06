// Import Express framework để tạo router
import express from 'express';
// Import middleware xác thực và phân quyền
import { protect, restrictTo } from '../middleware/auth.js';
// Import các controller xử lý logic user
import { 
  getUsers,           // Lấy danh sách users
  getUser,            // Lấy thông tin một user
  createUser,         // Tạo user mới
  updateUser,         // Cập nhật user
  deleteUser,         // Xóa user
  getUserProfile,     // Lấy profile của user hiện tại
  updateUserProfile,  // Cập nhật profile của user hiện tại
  changePassword      // Đổi mật khẩu
} from '../controllers/userController.js';

// Tạo router instance
const router = express.Router();

// ==================== USER ROUTES ====================

// Bảo vệ tất cả routes - yêu cầu đăng nhập
router.use(protect);

/**
 * Routes cho profile (tất cả user đã đăng nhập)
 * PHẢI ĐẶT TRƯỚC /:id để tránh conflict với route parameter
 */

// Lấy thông tin profile của user hiện tại
router.get('/profile', getUserProfile);

// Cập nhật thông tin profile của user hiện tại
router.put('/profile', updateUserProfile);

// Đổi mật khẩu của user hiện tại
router.put('/change-password', changePassword);

/**
 * Routes cho giáo viên và admin
 * Quản lý users trong hệ thống
 */

// Lấy danh sách tất cả users
router.get('/', getUsers);

// Tạo user mới
router.post('/', restrictTo('admin', 'teacher'), createUser);

/**
 * Routes có parameter (/:id)
 * PHẢI ĐẶT SAU /profile để tránh conflict
 */

// Lấy thông tin một user theo ID
router.get('/:id', getUser);

// Cập nhật thông tin user (chỉ admin)
router.patch('/:id', restrictTo('admin'), updateUser);

// Xóa user (admin hoặc teacher)
router.delete('/:id', restrictTo('admin', 'teacher'), deleteUser);

// Export router để sử dụng trong app chính
export default router; 