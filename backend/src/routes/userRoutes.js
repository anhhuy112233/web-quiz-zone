import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { getUsers, getUser, createUser, updateUser, deleteUser, getUserProfile, updateUserProfile, changePassword } from '../controllers/userController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes cho profile (tất cả user) - PHẢI ĐẶT TRƯỚC /:id
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.put('/change-password', changePassword);

// Routes cho giáo viên và admin
router.get('/', getUsers);
router.post('/', restrictTo('admin', 'teacher'), createUser);

// Routes có parameter - PHẢI ĐẶT SAU /profile
router.get('/:id', getUser);
router.patch('/:id', restrictTo('admin'), updateUser);
router.delete('/:id', restrictTo('admin', 'teacher'), deleteUser);

export default router; 