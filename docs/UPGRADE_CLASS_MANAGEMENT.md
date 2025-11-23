# 📚 NÂNG CẤP HỆ THỐNG - QUẢN LÝ LỚP HỌC VÀ PHÂN QUYỀN

## 🎯 TỔNG QUAN

Đã nâng cấp hệ thống để hỗ trợ quản lý lớp học và phân quyền chi tiết theo yêu cầu:

1. **Sinh viên**: Chỉ xem và làm bài thi của lớp mình
2. **Giáo viên**: Chỉ xem/sửa/xóa đề thi do mình tạo
3. **Admin**: Toàn quyền quản lý

---

## ✅ CÁC THAY ĐỔI ĐÃ THỰC HIỆN

### 1. **Model Class (Lớp học)** - MỚI

**File**: `backend/src/models/Class.js`

**Các trường**:
- `classCode` (String, unique, required) - Mã lớp (ví dụ: "IT01")
- `className` (String, required) - Tên lớp
- `description` (String) - Mô tả lớp
- `teachers` (Array of ObjectId, ref: User) - Danh sách giáo viên
- `maxStudents` (Number, default: 50) - Số lượng sinh viên tối đa
- `status` (Enum: 'active', 'inactive', 'archived') - Trạng thái lớp

**Indexes**:
- `classCode` - Tối ưu tìm kiếm theo mã lớp
- `status` - Tối ưu filter theo trạng thái

---

### 2. **Cập nhật User Model**

**File**: `backend/src/models/User.js`

**Thêm các trường**:
- `studentId` (String, unique, sparse) - Mã sinh viên (chỉ cho student)
- `teacherId` (String, unique, sparse) - Mã giáo viên (chỉ cho teacher)
- `classId` (ObjectId, ref: Class) - Mã lớp (chỉ cho student)

**Validation**:
- Admin không cần studentId, teacherId, classId
- Student và Teacher có thể tạo trước, gán ID sau (linh hoạt)

**Indexes**:
- `studentId` - Tối ưu tìm kiếm theo mã sinh viên
- `teacherId` - Tối ưu tìm kiếm theo mã giáo viên
- `classId` - Tối ưu tìm kiếm theo lớp
- `role + classId` - Tối ưu filter theo role và lớp

---

### 3. **Cập nhật Exam Model**

**File**: `backend/src/models/Exam.js`

**Thêm trường**:
- `classId` (ObjectId, ref: Class) - Mã lớp của đề thi

**Cập nhật**:
- `isPublic` (Boolean) - Trạng thái công khai (đã có sẵn, giữ nguyên)

**Indexes mới**:
- `classId` - Tối ưu filter theo lớp
- `classId + isPublic` - Tối ưu filter theo lớp và trạng thái public
- `createdBy + classId` - Tối ưu filter theo người tạo và lớp

---

### 4. **Class Controller & Routes** - MỚI

**File**: `backend/src/controllers/classController.js`
**File**: `backend/src/routes/classes.js`

**Các endpoints**:

#### GET `/api/classes`
- Lấy danh sách tất cả lớp học
- **Admin**: Xem tất cả
- **Teacher**: Chỉ xem lớp mà mình là giáo viên

#### GET `/api/classes/:id`
- Lấy thông tin chi tiết một lớp học
- Bao gồm danh sách sinh viên trong lớp

#### POST `/api/classes` (Admin only)
- Tạo lớp học mới
- Body: `{ classCode, className, description, teachers[], maxStudents }`

#### PATCH `/api/classes/:id` (Admin only)
- Cập nhật thông tin lớp học

#### DELETE `/api/classes/:id` (Admin only)
- Xóa lớp học (chỉ khi không còn sinh viên)

#### POST `/api/classes/:id/students` (Admin only)
- Thêm sinh viên vào lớp
- Body: `{ studentId }`

#### DELETE `/api/classes/:id/students/:studentId` (Admin only)
- Xóa sinh viên khỏi lớp

---

### 5. **Cập nhật Exam Controller**

**File**: `backend/src/controllers/examController.js`

#### `getAllExams()` - Cập nhật logic filter:

**Sinh viên (Student)**:
- Chỉ xem được bài thi có `classId` = lớp của mình
- Chỉ xem được bài thi có `isPublic = true`
- Phải có `classId` (nếu chưa có thì báo lỗi)

**Giáo viên (Teacher)**:
- Chỉ xem được bài thi do mình tạo (`createdBy = userId`)
- Không thấy bài thi của giáo viên khác

**Admin**:
- Xem tất cả bài thi (không filter)

#### `getExam()` - Cập nhật kiểm tra quyền:

**Sinh viên**:
- Kiểm tra có `classId` chưa
- Kiểm tra bài thi có phải của lớp mình không
- Kiểm tra bài thi có `isPublic = true` không

**Giáo viên**:
- Chỉ xem được bài thi do mình tạo

**Admin**:
- Xem được tất cả

#### `startExam()` - Cập nhật kiểm tra:

- Kiểm tra sinh viên có `classId` chưa
- Kiểm tra bài thi có phải của lớp mình không
- Kiểm tra bài thi có `isPublic = true` không

#### `updateExam()` & `deleteExam()` - Giữ nguyên:
- Giáo viên chỉ sửa/xóa được bài thi do mình tạo
- Admin có thể sửa/xóa tất cả

---

### 6. **Cập nhật User Controller**

**File**: `backend/src/controllers/userController.js`

#### `createUser()` - Hỗ trợ thêm:
- `studentId` - Mã sinh viên
- `teacherId` - Mã giáo viên
- `classId` - Mã lớp
- Validation: Kiểm tra studentId và teacherId đã tồn tại chưa

---

### 7. **Cập nhật Index.js**

**File**: `backend/src/index.js`

**Thêm route**:
```javascript
import classRoutes from './routes/classes.js';
app.use('/api/classes', classRoutes);
```

---

## 📋 API ENDPOINTS MỚI

### Class Management

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| GET | `/api/classes` | Lấy danh sách lớp | All (filter theo role) |
| GET | `/api/classes/:id` | Chi tiết lớp | All (filter theo role) |
| POST | `/api/classes` | Tạo lớp mới | Admin only |
| PATCH | `/api/classes/:id` | Cập nhật lớp | Admin only |
| DELETE | `/api/classes/:id` | Xóa lớp | Admin only |
| POST | `/api/classes/:id/students` | Thêm sinh viên | Admin only |
| DELETE | `/api/classes/:id/students/:studentId` | Xóa sinh viên | Admin only |

---

## 🔐 PHÂN QUYỀN CHI TIẾT

### Sinh viên (Student)

**Quyền hạn**:
- ✅ Xem danh sách đề thi của lớp mình (isPublic = true)
- ✅ Xem chi tiết đề thi của lớp mình
- ✅ Làm bài thi của lớp mình
- ❌ Không xem đề thi của lớp khác
- ❌ Không xem đề thi không public
- ❌ Không tạo/sửa/xóa đề thi

**Yêu cầu**:
- Phải có `studentId` (unique)
- Phải có `classId` (thuộc về một lớp)

---

### Giáo viên (Teacher)

**Quyền hạn**:
- ✅ Tạo đề thi mới
- ✅ Xem/sửa/xóa đề thi do mình tạo
- ✅ Xem lớp mà mình là giáo viên
- ❌ Không xem đề thi của giáo viên khác
- ❌ Không quản lý lớp (chỉ admin)

**Yêu cầu**:
- Phải có `teacherId` (unique)

---

### Admin

**Quyền hạn**:
- ✅ Toàn quyền quản lý:
  - Tất cả sinh viên
  - Tất cả giáo viên
  - Tất cả đề thi
  - Tất cả lớp học
- ✅ Tạo/sửa/xóa lớp
- ✅ Gán sinh viên vào lớp
- ✅ Xem tất cả dữ liệu

**Yêu cầu**:
- Không cần `studentId`, `teacherId`, `classId`

---

## 📝 VÍ DỤ SỬ DỤNG

### 1. Tạo lớp học (Admin)

```bash
POST /api/classes
{
  "classCode": "IT01",
  "className": "Lớp Công nghệ thông tin 01",
  "description": "Lớp học CNTT năm 2024",
  "teachers": ["teacher_id_1", "teacher_id_2"],
  "maxStudents": 50
}
```

### 2. Tạo sinh viên với lớp (Admin)

```bash
POST /api/users
{
  "name": "Nguyễn Văn A",
  "email": "student@example.com",
  "password": "password123",
  "role": "student",
  "studentId": "SV001",
  "classId": "class_id_here"
}
```

### 3. Tạo giáo viên (Admin)

```bash
POST /api/users
{
  "name": "Trần Thị B",
  "email": "teacher@example.com",
  "password": "password123",
  "role": "teacher",
  "teacherId": "GV001"
}
```

### 4. Tạo đề thi cho lớp (Teacher)

```bash
POST /api/exams
{
  "title": "Bài thi giữa kỳ",
  "description": "Bài thi môn Toán",
  "duration": 60,
  "totalQuestions": 20,
  "classId": "class_id_here",
  "isPublic": true,
  "startTime": "2024-01-15T08:00:00Z",
  "endTime": "2024-01-15T10:00:00Z",
  "status": "scheduled",
  "questions": [...]
}
```

### 5. Sinh viên xem đề thi của lớp mình

```bash
GET /api/exams
# Tự động filter:
# - classId = classId của sinh viên
# - isPublic = true
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Migration dữ liệu cũ

Nếu bạn đã có dữ liệu cũ, cần:

1. **Tạo lớp học** cho các sinh viên hiện có
2. **Gán classId** cho các sinh viên
3. **Gán studentId** cho các sinh viên
4. **Gán teacherId** cho các giáo viên
5. **Gán classId** cho các đề thi (nếu cần)

### 2. Validation

- `studentId` và `teacherId` phải unique
- Sinh viên phải có `classId` để xem và làm bài thi
- Đề thi phải có `isPublic = true` để sinh viên thấy

### 3. Backward Compatibility

- Các API cũ vẫn hoạt động
- Admin vẫn xem được tất cả (không bị ảnh hưởng)
- Cần cập nhật frontend để hiển thị và filter theo class

---

## 🚀 BƯỚC TIẾP THEO

### Frontend (Chưa implement)

Cần cập nhật frontend để:

1. **Quản lý lớp học** (Admin):
   - Trang danh sách lớp
   - Tạo/sửa/xóa lớp
   - Gán sinh viên vào lớp

2. **Tạo đề thi** (Teacher):
   - Chọn lớp khi tạo đề thi
   - Chọn trạng thái public

3. **Xem đề thi** (Student):
   - Chỉ hiển thị đề thi của lớp mình
   - Filter theo lớp

4. **User Management** (Admin):
   - Thêm studentId, teacherId khi tạo user
   - Gán classId cho sinh viên

---

## 📚 TÀI LIỆU LIÊN QUAN

- [Tổng hợp chức năng](./TONG_HOP_CHUC_NANG.md)
- [Các tính năng còn thiếu](./CAC_TINH_NANG_CON_THIEU.md)

---

*Cập nhật: 2024*

