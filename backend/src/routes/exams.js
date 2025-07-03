import express from 'express';
import multer from 'multer';
import {
  createExam,
  getAllExams,
  getExam,
  updateExam,
  deleteExam,
  startExam,
  submitExam,
  parseExcelFile
} from '../controllers/examController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'text/csv' ||
        file.mimetype === 'application/csv') {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV'), false);
    }
  }
});

// Protect all routes
router.use(protect);

// Routes for all authenticated users
router.get('/', getAllExams);
router.get('/:id', getExam);

// Routes for students
router.post('/:id/start', restrictTo('student'), startExam);
router.post('/:id/submit', restrictTo('student'), submitExam);

// Routes for teachers and admins
router.post('/', restrictTo('teacher', 'admin'), createExam);
router.post('/parse-excel', restrictTo('teacher', 'admin'), upload.single('file'), parseExcelFile);
router.patch('/:id', restrictTo('teacher', 'admin'), updateExam);
router.delete('/:id', restrictTo('teacher', 'admin'), deleteExam);

export default router; 