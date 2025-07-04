import User from '../models/User.js';
import Result from '../models/Result.js';
import bcrypt from 'bcryptjs';

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

// Lấy thông tin profile của user hiện tại
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng.'
      });
    }

    // Tính toán thống kê cho học sinh
    if (user.role === 'student') {
      const results = await Result.find({ user: user._id, status: 'completed' });
      const completedExams = results.length;
      const averageScore = completedExams > 0
        ? results.reduce((acc, curr) => acc + curr.score, 0) / completedExams
        : 0;

      const userWithStats = {
        ...user.toObject(),
        completedExams,
        averageScore: Math.round(averageScore)
      };

      return res.status(200).json({
        status: 'success',
        data: { user: userWithStats }
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Cập nhật thông tin profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Tên và email không được để trống.'
      });
    }

    // Kiểm tra email đã tồn tại chưa (trừ user hiện tại)
    const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email đã được sử dụng bởi người dùng khác.'
      });
    }

    // Cập nhật thông tin
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật thông tin thành công.',
      data: { user: updatedUser }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Đổi mật khẩu
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Mật khẩu hiện tại và mật khẩu mới không được để trống.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự.'
      });
    }

    // Lấy user hiện tại
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng.'
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Mật khẩu hiện tại không đúng.'
      });
    }

    // Hash mật khẩu mới
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Cập nhật mật khẩu
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Đổi mật khẩu thành công.'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 

// Lấy thông tin một user cụ thể
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng.'
      });
    }
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Tạo user mới
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Tên, email và mật khẩu không được để trống.'
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email đã được sử dụng.'
      });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student'
    });
    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;
    res.status(201).json({
      status: 'success',
      message: 'Tạo người dùng thành công.',
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Cập nhật user
export const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Tên và email không được để trống.'
      });
    }
    const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email đã được sử dụng bởi người dùng khác.'
      });
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select('-password');
    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng.'
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'Cập nhật người dùng thành công.',
      data: { user: updatedUser }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Xóa user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng.'
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'Xóa người dùng thành công.'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 