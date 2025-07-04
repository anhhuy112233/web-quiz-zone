import User from '../models/User.js';
import Result from '../models/Result.js';

export const getUsers = async (req, res) => {
  try {
    const query = {};

    // Nếu là học sinh, chỉ cho xem thông tin của mình
    if (req.user.role === 'student') {
      query._id = req.user.id;
    }

    // Nếu là giáo viên, chỉ cho xem danh sách học sinh
    if (req.user.role === 'teacher') {
      query.role = 'student';
    }

    // Nếu có filter role
    if (req.query.role) {
      query.role = req.query.role;
    }

    const users = await User.find(query).select('-password');

    // Tính toán thống kê cho học sinh
    if (req.user.role === 'teacher' || req.user.role === 'admin') {
      const usersWithStats = await Promise.all(users.map(async (user) => {
        if (user.role === 'student') {
          const results = await Result.find({ user: user._id, status: 'completed' });
          const completedExams = results.length;
          const averageScore = completedExams > 0
            ? results.reduce((acc, curr) => acc + curr.score, 0) / completedExams
            : 0;

          return {
            ...user.toObject(),
            completedExams,
            averageScore: Math.round(averageScore)
          };
        }
        return user;
      }));

      return res.status(200).json({
        status: 'success',
        results: usersWithStats.length,
        data: { users: usersWithStats }
      });
    }

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 