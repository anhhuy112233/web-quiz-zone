// Import Express framework để tạo router
import express from 'express';
// Import middleware xác thực và phân quyền
import { protect, restrictTo } from '../middleware/auth.js';
// Import model User để thao tác với database
import User from '../models/User.js';

// Tạo router instance
const router = express.Router();

// ==================== USER MANAGEMENT ROUTES ====================

// Bảo vệ tất cả routes - yêu cầu đăng nhập
router.use(protect);

/**
 * Route lấy danh sách tất cả users
 * GET /api/users
 * Query params: role (tùy chọn - lọc theo vai trò)
 * Headers: Authorization: Bearer <token>
 * Yêu cầu: Admin hoặc Teacher
 */
router.get('/', restrictTo('admin', 'teacher'), async (req, res) => {
  try {
    const query = {};
    
    // Lọc theo vai trò nếu có query parameter
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    // Tìm tất cả users theo điều kiện, loại bỏ trường password
    const users = await User.find(query).select('-password');
    
    // Trả về response thành công
    res.status(200).json({
      status: 'success',
      results: users.length,  // Số lượng users tìm được
      data: { users }
    });
  } catch (error) {
    // Trả về lỗi nếu có
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * Route lấy thông tin chi tiết một user
 * GET /api/users/:id
 * Params: id - ID của user
 * Headers: Authorization: Bearer <token>
 * Yêu cầu: Admin hoặc Teacher
 */
router.get('/:id', restrictTo('admin', 'teacher'), async (req, res) => {
  try {
    // Tìm user theo ID, loại bỏ trường password
    const user = await User.findById(req.params.id).select('-password');
    
    // Kiểm tra user có tồn tại không
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng.'
      });
    }
    
    // Trả về thông tin user
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    // Trả về lỗi nếu có
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * Route cập nhật thông tin user
 * PATCH /api/users/:id
 * Params: id - ID của user
 * Body: Các trường cần cập nhật
 * Headers: Authorization: Bearer <token>
 * Yêu cầu: Admin (chỉ admin mới có quyền cập nhật user)
 */
router.patch('/:id', restrictTo('admin'), async (req, res) => {
  try {
    // Cập nhật user theo ID với dữ liệu mới
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,           // Trả về document đã được cập nhật
        runValidators: true  // Chạy validation khi cập nhật
      }
    ).select('-password');   // Loại bỏ trường password

    // Kiểm tra user có tồn tại không
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng.'
      });
    }

    // Trả về user đã được cập nhật
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    // Trả về lỗi nếu có
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * Route xóa user
 * DELETE /api/users/:id
 * Params: id - ID của user
 * Headers: Authorization: Bearer <token>
 * Yêu cầu: Admin (chỉ admin mới có quyền xóa user)
 */
router.delete('/:id', restrictTo('admin'), async (req, res) => {
  try {
    // Xóa user theo ID
    const user = await User.findByIdAndDelete(req.params.id);
    
    // Kiểm tra user có tồn tại không
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng.'
      });
    }
    
    // Trả về response thành công (204 - No Content)
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    // Trả về lỗi nếu có
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Export router để sử dụng trong app chính
export default router; 