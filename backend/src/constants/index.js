// API Response Status
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error'
};

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
};

// Exam Status
export const EXAM_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  COMPLETED: 'completed'
};

// Result Status
export const RESULT_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  TIMEOUT: 'timeout'
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Validation Messages
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

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/csv'
  ]
};

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// JWT
export const JWT = {
  EXPIRES_IN: '7d'
};

// Password
export const PASSWORD = {
  SALT_ROUNDS: 12,
  MIN_LENGTH: 6
}; 