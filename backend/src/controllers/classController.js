// Import các model cần thiết
import Class from '../models/Class.js';
import User from '../models/User.js';

/**
 * Lấy danh sách tất cả lớp học
 * GET /api/classes
 * - Admin: xem được tất cả lớp
 * - Teacher: xem được lớp mà mình là giáo viên
 */
export const getAllClasses = async (req, res) => {
  try {
    const query = {};

    // Nếu có query param ?all=true, cho phép teacher xem tất cả lớp (dùng khi tạo exam)
    const showAll = req.query.all === 'true';

    // Nếu user là teacher và không có flag all=true, chỉ xem được lớp mà mình là giáo viên
    if (req.user.role === 'teacher' && !showAll) {
      query.teachers = req.user._id || req.user.id;
    }

    // Admin xem được tất cả (không cần filter)
    // Teacher với all=true cũng xem được tất cả

    // Tìm tất cả lớp học
    const classes = await Class.find(query)
      .populate('teachers', 'name email teacherId')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: classes.length,
      data: { classes }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Lấy thông tin chi tiết một lớp học
 * GET /api/classes/:id
 */
export const getClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('teachers', 'name email teacherId');

    if (!classData) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy lớp học.'
      });
    }

    // Nếu user là teacher, kiểm tra có phải giáo viên của lớp không
    if (req.user.role === 'teacher') {
      const isTeacher = classData.teachers.some(
        teacher => teacher._id.toString() === (req.user._id || req.user.id).toString()
      );
      if (!isTeacher) {
        return res.status(403).json({
          status: 'error',
          message: 'Bạn không có quyền xem lớp học này.'
        });
      }
    }

    // Lấy danh sách sinh viên trong lớp
    const students = await User.find({
      classId: classData._id,
      role: 'student'
    }).select('name email studentId');

    res.status(200).json({
      status: 'success',
      data: {
        class: {
          ...classData.toObject(),
          students
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Tạo lớp học mới
 * POST /api/classes
 * Chỉ admin mới có quyền tạo lớp
 */
export const createClass = async (req, res) => {
  try {
    const { classCode, className, description, teachers, maxStudents } = req.body;

    // Kiểm tra classCode đã tồn tại chưa
    const existingClass = await Class.findOne({ classCode });
    if (existingClass) {
      return res.status(400).json({
        status: 'error',
        message: 'Mã lớp đã tồn tại.'
      });
    }

    // Tạo lớp học mới
    const newClass = await Class.create({
      classCode,
      className,
      description,
      teachers: teachers || [],
      maxStudents: maxStudents || 50
    });

    res.status(201).json({
      status: 'success',
      data: { class: newClass }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Cập nhật thông tin lớp học
 * PATCH /api/classes/:id
 * Chỉ admin mới có quyền cập nhật
 */
export const updateClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy lớp học.'
      });
    }

    // Kiểm tra classCode mới có trùng không (nếu có thay đổi)
    if (req.body.classCode && req.body.classCode !== classData.classCode) {
      const existingClass = await Class.findOne({ classCode: req.body.classCode });
      if (existingClass) {
        return res.status(400).json({
          status: 'error',
          message: 'Mã lớp đã tồn tại.'
        });
      }
    }

    // Cập nhật lớp học
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('teachers', 'name email teacherId');

    res.status(200).json({
      status: 'success',
      data: { class: updatedClass }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Xóa lớp học
 * DELETE /api/classes/:id
 * Chỉ admin mới có quyền xóa
 */
export const deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy lớp học.'
      });
    }

    // Kiểm tra có sinh viên trong lớp không
    const studentsCount = await User.countDocuments({
      classId: classData._id,
      role: 'student'
    });

    if (studentsCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Không thể xóa lớp học. Lớp còn ${studentsCount} sinh viên.`
      });
    }

    // Xóa lớp học
    await classData.deleteOne();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Thêm sinh viên vào lớp
 * POST /api/classes/:id/students
 * Chỉ admin mới có quyền
 */
export const addStudentToClass = async (req, res) => {
  try {
    const { studentId } = req.body;

    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy lớp học.'
      });
    }

    // Tìm sinh viên theo studentId hoặc userId
    const student = await User.findOne({
      $or: [
        { studentId: studentId },
        { _id: studentId }
      ],
      role: 'student'
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy sinh viên.'
      });
    }

    // Kiểm tra sinh viên đã thuộc lớp khác chưa
    if (student.classId && student.classId.toString() !== classData._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Sinh viên đã thuộc lớp khác.'
      });
    }

    // Kiểm tra số lượng sinh viên tối đa
    const currentStudents = await User.countDocuments({
      classId: classData._id,
      role: 'student'
    });

    if (currentStudents >= classData.maxStudents) {
      return res.status(400).json({
        status: 'error',
        message: `Lớp đã đạt số lượng sinh viên tối đa (${classData.maxStudents}).`
      });
    }

    // Gán sinh viên vào lớp
    student.classId = classData._id;
    await student.save();

    res.status(200).json({
      status: 'success',
      data: { student }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Xóa sinh viên khỏi lớp
 * DELETE /api/classes/:id/students/:studentId
 * Chỉ admin mới có quyền
 */
export const removeStudentFromClass = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findOne({
      $or: [
        { studentId: studentId },
        { _id: studentId }
      ],
      role: 'student',
      classId: req.params.id
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy sinh viên trong lớp này.'
      });
    }

    // Xóa classId của sinh viên
    student.classId = null;
    await student.save();

    res.status(200).json({
      status: 'success',
      data: { student }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

