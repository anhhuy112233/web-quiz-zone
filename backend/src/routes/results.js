import express from 'express';
import {
  getResults,
  getResult,
  getExamResults,
  getUserResults,
  deleteResult
} from '../controllers/resultController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes for all authenticated users
router.get('/', getResults);
router.get('/:id', getResult);

// Routes for teachers and admins
router.get('/exam/:examId', restrictTo('teacher', 'admin'), getExamResults);
router.get('/user/:userId', getUserResults);

router.delete('/:id', deleteResult);

export default router; 