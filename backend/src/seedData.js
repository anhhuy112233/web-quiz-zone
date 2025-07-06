/**
 * File tạo dữ liệu mẫu cho hệ thống
 * Chạy script này để tạo các tài khoản và đề thi mẫu để test
 */

// Import các dependencies cần thiết
import mongoose from 'mongoose';        // ODM cho MongoDB
import User from './models/User.js';     // Model User
import Exam from './models/Exam.js';     // Model Exam
import dotenv from 'dotenv';             // Load environment variables

// Load environment variables từ file .env
dotenv.config();

/**
 * Hàm chính để tạo dữ liệu mẫu
 * Tạo các tài khoản và đề thi mẫu để test hệ thống
 */
const seedData = async () => {
  try {
    // Kết nối đến MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Xóa dữ liệu cũ để tránh trùng lặp
    await User.deleteMany({});
    await Exam.deleteMany({});

    // ==================== TẠO USERS MẪU ====================

    // Tạo tài khoản giáo viên mẫu
    const teacher = await User.create({
      name: 'Giáo viên Mẫu',
      email: 'teacher@example.com',
      password: 'password123',
      role: 'teacher'
    });

    // Tạo tài khoản học sinh mẫu
    const student = await User.create({
      name: 'Học sinh Mẫu',
      email: 'student@example.com',
      password: 'password123',
      role: 'student'
    });

    // Tạo tài khoản admin mẫu
    const admin = await User.create({
      name: 'Admin Mẫu',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // ==================== TẠO EXAMS MẪU ====================

    // Đề thi Toán học - sắp diễn ra (scheduled)
    const exam1 = await Exam.create({
      title: 'Bài thi Toán học - Chương 1',
      description: 'Bài thi về các phép tính cơ bản',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Ngày mai
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),   // Ngày mai + 1 giờ
      duration: 60, // 60 phút
      totalQuestions: 20,
      status: 'scheduled',  // Đã lên lịch
      isPublic: true,       // Công khai
      createdBy: teacher._id,
      questions: [
        {
          question: '2 + 2 = ?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1,  // Index của đáp án đúng (0-based)
          points: 5          // Điểm cho câu hỏi này
        },
        {
          question: '5 x 6 = ?',
          options: ['25', '30', '35', '40'],
          correctAnswer: 1,  // Index của đáp án đúng
          points: 5
        }
      ]
    });

    // Đề thi Vật lý - sắp diễn ra (scheduled)
    const exam2 = await Exam.create({
      title: 'Bài thi Vật lý - Chương 2',
      description: 'Bài thi về cơ học',
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Ngày kia
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // + 90 phút
      duration: 90, // 90 phút
      totalQuestions: 25,
      status: 'scheduled',
      isPublic: true,
      createdBy: teacher._id,
      questions: [
        {
          question: 'Công thức tính vận tốc là gì?',
          options: ['v = s/t', 'v = t/s', 'v = s*t', 'v = s+t'],
          correctAnswer: 0,  // Đáp án đầu tiên
          points: 4
        }
      ]
    });

    // Đề thi Hóa học - đã hoàn thành (completed)
    const exam3 = await Exam.create({
      title: 'Bài thi Hóa học - Chương 3',
      description: 'Bài thi về hóa vô cơ',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hôm qua
      endTime: new Date(Date.now() - 23 * 60 * 60 * 1000),   // Hôm qua + 1 giờ
      duration: 45, // 45 phút
      totalQuestions: 15,
      status: 'completed',  // Đã hoàn thành
      isPublic: true,
      createdBy: teacher._id,
      questions: [
        {
          question: 'Công thức hóa học của nước là gì?',
          options: ['H2O', 'CO2', 'O2', 'H2'],
          correctAnswer: 0,  // Đáp án đầu tiên
          points: 6
        }
      ]
    });

    // ==================== LOG KẾT QUẢ ====================

    console.log('Sample data created successfully!');
    console.log('Users created:', { 
      teacher: teacher.email, 
      student: student.email, 
      admin: admin.email 
    });
    console.log('Exams created:', exam1.title, exam2.title, exam3.title);

    // Thoát chương trình thành công
    process.exit(0);
  } catch (error) {
    // Log lỗi nếu có
    console.error('Error seeding data:', error);
    // Thoát chương trình với mã lỗi
    process.exit(1);
  }
};

// Chạy hàm tạo dữ liệu mẫu
seedData(); 