// Import Express framework để tạo router
import express from 'express';
// Import các controller xử lý logic authentication
import {
  register,        // Đăng ký tài khoản mới
  login,           // Đăng nhập
  getMe,           // Lấy thông tin user hiện tại
  updatePassword   // Cập nhật mật khẩu
} from '../controllers/authController.js';
// Import middleware bảo vệ route (yêu cầu đăng nhập)
import { protect } from '../middleware/auth.js';

// Tạo router instance
const router = express.Router();

// ==================== AUTHENTICATION ROUTES ====================

/**
 * Route đăng ký tài khoản mới
 * POST /api/auth/register
 * Body: { name, email, password, role }
 */
router.post('/register', register);

/**
 * Route đăng nhập
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', login);

/**
 * Route lấy thông tin user hiện tại
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 * Yêu cầu: Đăng nhập (có middleware protect)
 */
router.get('/me', protect, getMe);

/**
 * Route cập nhật mật khẩu
 * PATCH /api/auth/update-password
 * Headers: Authorization: Bearer <token>
 * Body: { currentPassword, newPassword }
 * Yêu cầu: Đăng nhập (có middleware protect)
 */
router.patch('/update-password', protect, updatePassword);

// Export router để sử dụng trong app chính
export default router; 