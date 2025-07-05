// Import các model và thư viện cần thiết
import User from "../models/User.js";        // Model User để tương tác với bảng users
import Result from "../models/Result.js";    // Model Result để lấy kết quả thi
import Exam from "../models/Exam.js";        // Model Exam để đếm số đề thi
import bcrypt from "bcryptjs";               // Thư viện mã hóa mật khẩu

/**
 * Lấy danh sách tất cả users (có phân quyền theo role)
 * - Student: chỉ xem được thông tin của mình
 * - Teacher: xem được danh sách tất cả students
 * - Admin: xem được tất cả users
 */
export const getUsers = async (req, res) => {
  try {
    const query = {};

    // Phân quyền theo role của user hiện tại
    // Nếu là học sinh, chỉ cho xem thông tin của mình
    if (req.user.role === "student") {
      query._id = req.user.id;
    }

    // Nếu là giáo viên, chỉ cho xem danh sách học sinh
    if (req.user.role === "teacher") {
      query.role = "student";
    }

    // Nếu có filter role từ query parameter (ví dụ: ?role=student)
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Tìm users theo query, loại trừ trường password
    const users = await User.find(query).select("-password");

    // Tính toán thống kê cho học sinh (chỉ teacher và admin mới có quyền)
    if (req.user.role === "teacher" || req.user.role === "admin") {
      // Sử dụng Promise.all để xử lý song song các query thống kê
      const usersWithStats = await Promise.all(
        users.map(async (user) => {
          // Chỉ tính thống kê cho students
          if (user.role === "student") {
            // Tìm tất cả kết quả thi đã hoàn thành của student này
            const results = await Result.find({
              user: user._id,
              status: "completed",
            });
            
            // Tính số bài thi đã hoàn thành
            const completedExams = results.length;
            
            // Tính điểm trung bình (nếu có bài thi nào)
            const averageScore =
              completedExams > 0
                ? results.reduce((acc, curr) => acc + curr.score, 0) /
                  completedExams
                : 0;

            // Trả về user với thống kê bổ sung
            return {
              ...user.toObject(),           // Chuyển mongoose object thành plain object
              completedExams,               // Số bài thi đã hoàn thành
              averageScore: Math.round(averageScore), // Điểm trung bình (làm tròn)
            };
          }
          return user; // Nếu không phải student thì trả về user gốc
        })
      );

      // Trả về response với thống kê
      return res.status(200).json({
        status: "success",
        results: usersWithStats.length,     // Số lượng users
        data: { users: usersWithStats },    // Dữ liệu users với thống kê
      });
    }

    // Trả về response thông thường (không có thống kê)
    res.status(200).json({
      status: "success",
      results: users.length,
      data: { users },
    });
  } catch (error) {
    // Xử lý lỗi
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Lấy thông tin profile của user hiện tại (đã đăng nhập)
 * Bao gồm thống kê theo role:
 * - Student: số bài thi đã làm, điểm trung bình
 * - Teacher: số đề thi đã tạo
 */
export const getUserProfile = async (req, res) => {
  try {
    // Lấy thông tin user hiện tại từ database (req.user.id được set bởi middleware auth)
    const user = await User.findById(req.user.id).select("-password");

    // Kiểm tra user có tồn tại không
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng.",
      });
    }

    // Tính toán thống kê cho học sinh
    if (user.role === "student") {
      // Tìm tất cả kết quả thi đã hoàn thành
      const results = await Result.find({
        user: user._id,
        status: "completed",
      });
      
      // Tính số bài thi đã hoàn thành
      const completedExams = results.length;
      
      // Tính điểm trung bình
      const averageScore =
        completedExams > 0
          ? results.reduce((acc, curr) => acc + curr.score, 0) / completedExams
          : 0;

      // Tạo object user với thống kê
      const userWithStats = {
        ...user.toObject(),
        completedExams,
        averageScore: Math.round(averageScore),
      };

      // Trả về response cho student
      return res.status(200).json({
        status: "success",
        data: { user: userWithStats },
      });
    }

    // Tính toán thống kê cho giáo viên
    if (user.role === "teacher") {
      // Đếm số đề thi đã tạo bởi giáo viên này
      const totalExams = await Exam.countDocuments({ createdBy: user._id });

      // Tạo object user với thống kê
      const userWithStats = {
        ...user.toObject(),
        totalExams,
      };

      // Trả về response cho teacher
      return res.status(200).json({
        status: "success",
        data: { user: userWithStats },
      });
    }

    // Trả về response cho admin (không có thống kê đặc biệt)
    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    // Xử lý lỗi
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Cập nhật thông tin profile của user hiện tại
 * Chỉ cho phép cập nhật: name, email
 */
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate input - kiểm tra dữ liệu đầu vào
    if (!name || !email) {
      return res.status(400).json({
        status: "error",
        message: "Tên và email không được để trống.",
      });
    }

    // Kiểm tra email đã tồn tại chưa (trừ user hiện tại)
    // $ne = not equal, nghĩa là tìm email giống nhưng khác user ID
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user.id },
    });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email đã được sử dụng bởi người dùng khác.",
      });
    }

    // Cập nhật thông tin user
    // new: true = trả về document đã được cập nhật
    // runValidators: true = chạy validation của mongoose
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password"); // Loại trừ trường password

    // Kiểm tra user có tồn tại không
    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng.",
      });
    }

    // Trả về response thành công
    res.status(200).json({
      status: "success",
      message: "Cập nhật thông tin thành công.",
      data: { user: updatedUser },
    });
  } catch (error) {
    // Xử lý lỗi
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Đổi mật khẩu của user hiện tại
 * Yêu cầu: mật khẩu hiện tại + mật khẩu mới
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Mật khẩu hiện tại và mật khẩu mới không được để trống.",
      });
    }

    // Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
    }

    // Lấy user hiện tại (bao gồm password để so sánh)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng.",
      });
    }

    // Kiểm tra mật khẩu hiện tại có đúng không
    // bcrypt.compare so sánh mật khẩu plain text với hash
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({
        status: "error",
        message: "Mật khẩu hiện tại không đúng.",
      });
    }

    // Hash mật khẩu mới
    const saltRounds = 10; // Số vòng hash (càng cao càng an toàn nhưng chậm hơn)
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Cập nhật mật khẩu mới
    user.password = hashedPassword;
    await user.save(); // Lưu vào database

    // Trả về response thành công
    res.status(200).json({
      status: "success",
      message: "Đổi mật khẩu thành công.",
    });
  } catch (error) {
    // Xử lý lỗi
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Lấy thông tin một user cụ thể theo ID
 * Chỉ admin mới có quyền truy cập (được kiểm tra ở middleware)
 */
export const getUser = async (req, res) => {
  try {
    // Tìm user theo ID từ URL parameter
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng.",
      });
    }
    
    // Trả về thông tin user
    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    // Xử lý lỗi
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Tạo user mới (chỉ admin và teacher mới có quyền)
 * Tự động hash mật khẩu trước khi lưu
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Tên, email và mật khẩu không được để trống.",
      });
    }
    
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email đã được sử dụng.",
      });
    }
    
    // Hash mật khẩu trước khi lưu
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Tạo user mới
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student", // Mặc định là student nếu không có role
    });
    
    // Loại bỏ password khỏi response
    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;
    
    // Trả về response thành công
    res.status(201).json({
      status: "success",
      message: "Tạo người dùng thành công.",
      data: { user: userWithoutPassword },
    });
  } catch (error) {
    // Xử lý lỗi
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Cập nhật thông tin user theo ID (chỉ admin mới có quyền)
 * Có thể cập nhật: name, email, role
 */
export const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        status: "error",
        message: "Tên và email không được để trống.",
      });
    }
    
    // Kiểm tra email đã tồn tại chưa (trừ user đang cập nhật)
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.params.id },
    });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email đã được sử dụng bởi người dùng khác.",
      });
    }
    
    // Cập nhật user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select("-password");
    
    // Kiểm tra user có tồn tại không
    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng.",
      });
    }
    
    // Trả về response thành công
    res.status(200).json({
      status: "success",
      message: "Cập nhật người dùng thành công.",
      data: { user: updatedUser },
    });
  } catch (error) {
    // Xử lý lỗi
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Xóa user theo ID (chỉ admin và teacher mới có quyền)
 * Xóa hoàn toàn user khỏi database
 */
export const deleteUser = async (req, res) => {
  try {
    // Tìm và xóa user theo ID
    const user = await User.findByIdAndDelete(req.params.id);
    
    // Kiểm tra user có tồn tại không
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng.",
      });
    }
    
    // Trả về response thành công
    res.status(200).json({
      status: "success",
      message: "Xóa người dùng thành công.",
    });
  } catch (error) {
    // Xử lý lỗi
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
