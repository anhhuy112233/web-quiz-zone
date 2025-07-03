import mongoose from 'mongoose';
import User from './models/User.js';
import Exam from './models/Exam.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Exam.deleteMany({});

    // Create sample users
    const teacher = await User.create({
      name: 'Giáo viên Mẫu',
      email: 'teacher@example.com',
      password: 'password123',
      role: 'teacher'
    });

    const student = await User.create({
      name: 'Học sinh Mẫu',
      email: 'student@example.com',
      password: 'password123',
      role: 'student'
    });

    const admin = await User.create({
      name: 'Admin Mẫu',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Create sample exams
    const exam1 = await Exam.create({
      title: 'Bài thi Toán học - Chương 1',
      description: 'Bài thi về các phép tính cơ bản',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // Tomorrow + 1 hour
      duration: 60, // 60 minutes
      totalQuestions: 20,
      status: 'scheduled',
      isPublic: true,
      createdBy: teacher._id,
      questions: [
        {
          question: '2 + 2 = ?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1,
          points: 5
        },
        {
          question: '5 x 6 = ?',
          options: ['25', '30', '35', '40'],
          correctAnswer: 1,
          points: 5
        }
      ]
    });

    const exam2 = await Exam.create({
      title: 'Bài thi Vật lý - Chương 2',
      description: 'Bài thi về cơ học',
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // + 90 minutes
      duration: 90, // 90 minutes
      totalQuestions: 25,
      status: 'scheduled',
      isPublic: true,
      createdBy: teacher._id,
      questions: [
        {
          question: 'Công thức tính vận tốc là gì?',
          options: ['v = s/t', 'v = t/s', 'v = s*t', 'v = s+t'],
          correctAnswer: 0,
          points: 4
        }
      ]
    });

    const exam3 = await Exam.create({
      title: 'Bài thi Hóa học - Chương 3',
      description: 'Bài thi về hóa vô cơ',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      endTime: new Date(Date.now() - 23 * 60 * 60 * 1000), // Yesterday + 1 hour
      duration: 45, // 45 minutes
      totalQuestions: 15,
      status: 'completed',
      isPublic: true,
      createdBy: teacher._id,
      questions: [
        {
          question: 'Công thức hóa học của nước là gì?',
          options: ['H2O', 'CO2', 'O2', 'H2'],
          correctAnswer: 0,
          points: 6
        }
      ]
    });

    console.log('Sample data created successfully!');
    console.log('Users created:', { teacher: teacher.email, student: student.email, admin: admin.email });
    console.log('Exams created:', exam1.title, exam2.title, exam3.title);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 