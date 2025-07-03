import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes cho giáo viên và admin
router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', restrictTo('admin', 'teacher'), createUser);
router.patch('/:id', restrictTo('admin'), updateUser);
router.delete('/:id', restrictTo('admin', 'teacher'), deleteUser);

export default router; 