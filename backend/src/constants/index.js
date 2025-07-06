/**
 * File chứa tất cả các constants (hằng số) được sử dụng trong ứng dụng
 * Giúp chuẩn hóa và dễ dàng quản lý các giá trị cố định
 */

// ==================== API RESPONSE STATUS ====================
/**
 * Trạng thái response của API
 * Được sử dụng để chuẩn hóa format response
 */
export const API_STATUS = {
  SUCCESS: 'success',    // Thành công
  ERROR: 'error'         // Lỗi
};

// ==================== USER ROLES ====================
/**
 * Các vai trò người dùng trong hệ thống
 * Được sử dụng để phân quyền và kiểm soát truy cập
 */
export const USER_ROLES = {
  STUDENT: 'student',    // Học sinh - có thể làm bài thi
  TEACHER: 'teacher',    // Giáo viên - có thể tạo và quản lý đề thi
  ADMIN: 'admin'         // Admin - có toàn quyền quản lý hệ thống
};

// ==================== EXAM STATUS ====================
/**
 * Trạng thái của đề thi
 * Quản lý vòng đời của một đề thi từ lúc tạo đến lúc hoàn thành
 */
export const EXAM_STATUS = {
  DRAFT: 'draft',        // Bản nháp - đang soạn thảo
  SCHEDULED: 'scheduled', // Đã lên lịch - chờ đến giờ thi
  ACTIVE: 'active',      // Đang hoạt động - học sinh có thể làm bài
  COMPLETED: 'completed' // Đã hoàn thành - hết thời gian thi
};

// ==================== RESULT STATUS ====================
/**
 * Trạng thái của kết quả bài thi
 * Theo dõi trạng thái làm bài của học sinh
 */
export const RESULT_STATUS = {
  IN_PROGRESS: 'in_progress', // Đang làm bài
  COMPLETED: 'completed',     // Đã hoàn thành bài thi
  TIMEOUT: 'timeout'          // Hết thời gian làm bài
};

// ==================== HTTP STATUS CODES ====================
/**
 * Các mã HTTP status code chuẩn
 * Được sử dụng để trả về response với status code phù hợp
 */
export const HTTP_STATUS = {
  OK: 200,                    // Thành công
  CREATED: 201,               // Tạo mới thành công
  BAD_REQUEST: 400,           // Yêu cầu không hợp lệ
  UNAUTHORIZED: 401,          // Chưa đăng nhập
  FORBIDDEN: 403,             // Không có quyền
  NOT_FOUND: 404,             // Không tìm thấy
  INTERNAL_SERVER_ERROR: 500  // Lỗi server
};

// ==================== VALIDATION MESSAGES ====================
/**
 * Các message lỗi validation chuẩn
 * Đảm bảo tính nhất quán trong thông báo lỗi
 */
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'Trường này là bắt buộc',
  INVALID_EMAIL: 'Email không hợp lệ',
  PASSWORD_MIN_LENGTH: 'Mật khẩu phải có ít nhất 6 ký tự',
  EMAIL_EXISTS: 'Email đã được sử dụng',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  UNAUTHORIZED: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.',
  FORBIDDEN: 'Bạn không có quyền thực hiện hành động này.',
  USER_NOT_FOUND: 'Không tìm thấy người dùng.',
  EXAM_NOT_FOUND: 'Không tìm thấy đề thi.',
  RESULT_NOT_FOUND: 'Không tìm thấy kết quả.'
};

// ==================== FILE UPLOAD ====================
/**
 * Cấu hình upload file
 * Giới hạn kích thước và loại file được phép upload
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB - kích thước tối đa
  ALLOWED_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel',                                          // .xls
    'text/csv',                                                          // .csv
    'application/csv'                                                    // .csv
  ]
};

// ==================== PAGINATION ====================
/**
 * Cấu hình phân trang
 * Giới hạn số lượng item trên mỗi trang
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 10,  // Số item mặc định trên mỗi trang
  MAX_LIMIT: 100      // Số item tối đa trên mỗi trang
};

// ==================== JWT ====================
/**
 * Cấu hình JWT (JSON Web Token)
 * Thời gian hết hạn của token
 */
export const JWT = {
  EXPIRES_IN: '7d'  // Token hết hạn sau 7 ngày
};

// ==================== PASSWORD ====================
/**
 * Cấu hình mật khẩu
 * Độ mạnh và bảo mật của mật khẩu
 */
export const PASSWORD = {
  SALT_ROUNDS: 12,  // Số vòng hash bcrypt (càng cao càng bảo mật)
  MIN_LENGTH: 6     // Độ dài tối thiểu của mật khẩu
}; 