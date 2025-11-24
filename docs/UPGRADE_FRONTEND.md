# 🎨 NÂNG CẤP FRONTEND - QUẢN LÝ LỚP HỌC

## ✅ CÁC THAY ĐỔI ĐÃ THỰC HIỆN

### 1. **Cập nhật API Utils**

**File**: `frontend/src/utils/api.js`

**Thêm**:
- `getApiUrl(endpoint)` - Tạo full API URL
- `apiCall(endpoint, options)` - Helper function để gọi API
- Base URL từ environment variable

---

### 2. **Trang Quản lý Lớp học (Admin)** - MỚI

**File**: `frontend/src/pages/admin/Classes.jsx`

**Tính năng**:
- ✅ Xem danh sách tất cả lớp học
- ✅ Tạo lớp học mới
- ✅ Chỉnh sửa lớp học
- ✅ Xóa lớp học
- ✅ Xem danh sách sinh viên trong lớp
- ✅ Modal để quản lý lớp học

**UI Features**:
- Bảng hiển thị với thông tin: mã lớp, tên lớp, mô tả, số SV tối đa, trạng thái
- Form tạo/sửa với validation
- Modal xem danh sách sinh viên

---

### 3. **Cập nhật Quản lý Người dùng (Admin)**

**File**: `frontend/src/pages/admin/Users.jsx`

**Thêm các trường**:
- ✅ `studentId` - Mã sinh viên (chỉ hiện khi role = student)
- ✅ `teacherId` - Mã giáo viên (chỉ hiện khi role = teacher)
- ✅ `classId` - Mã lớp (chỉ hiện khi role = student)

**Cập nhật**:
- Form tạo user: Hiển thị các trường theo role
- Form sửa user: Hiển thị và cập nhật các trường mới
- Bảng hiển thị: Thêm cột "Mã SV/GV" và "Lớp"
- Tự động fetch danh sách lớp học để chọn

**Logic**:
- Khi chọn role = student → hiện studentId và classId
- Khi chọn role = teacher → hiện teacherId
- Khi chọn role = admin → ẩn tất cả các trường trên

---

### 4. **Cập nhật Form Tạo Đề thi (Teacher)**

**File**: `frontend/src/components/teacher/ExamForm.jsx`

**Thêm**:
- ✅ Select để chọn lớp học
- ✅ Tự động fetch danh sách lớp học
- ✅ Gửi `classId` khi tạo đề thi

**UI**:
- Dropdown chọn lớp với format: "Mã lớp - Tên lớp"
- Option "Chọn lớp (để trống nếu không áp dụng)"
- Tooltip giải thích: "Chọn lớp để chỉ sinh viên trong lớp đó mới thấy và làm bài thi này"

---

### 5. **Cập nhật Trang Xem Đề thi (Student)**

**File**: `frontend/src/pages/student/Exams.jsx`

**Cập nhật**:
- ✅ Sử dụng `getApiUrl()` thay vì hardcode URL
- ✅ Tự động filter theo lớp (backend xử lý)
- ✅ Chỉ hiển thị đề thi của lớp mình và có `isPublic = true`

**Lưu ý**: Backend đã tự động filter, frontend chỉ cần gọi API bình thường.

---

### 6. **Cập nhật Routing**

**File**: `frontend/src/App.jsx`

**Thêm route**:
```javascript
<Route path="/admin/classes" element={
  <ProtectedRoute role="admin">
    <Layout user={user} onLogout={handleLogout} onSessionChange={handleSessionChange}>
      <AdminClasses />
    </Layout>
  </ProtectedRoute>
} />
```

---

### 7. **Cập nhật Header Navigation**

**File**: `frontend/src/components/Header.jsx`

**Thêm menu item**:
- "Quản lý lớp học" cho Admin
- Link đến `/admin/classes`

---

## 📋 CÁC TRANG/COMPONENT ĐÃ CẬP NHẬT

| File | Thay đổi | Mô tả |
|------|----------|-------|
| `utils/api.js` | ✅ Cập nhật | Thêm `getApiUrl()` và `apiCall()` |
| `pages/admin/Classes.jsx` | ✅ Mới | Trang quản lý lớp học |
| `pages/admin/Users.jsx` | ✅ Cập nhật | Thêm studentId, teacherId, classId |
| `components/teacher/ExamForm.jsx` | ✅ Cập nhật | Thêm chọn lớp |
| `pages/student/Exams.jsx` | ✅ Cập nhật | Sử dụng getApiUrl |
| `App.jsx` | ✅ Cập nhật | Thêm route Classes |
| `components/Header.jsx` | ✅ Cập nhật | Thêm menu "Quản lý lớp học" |

---

## 🎯 LUỒNG SỬ DỤNG

### 1. Admin tạo lớp học
1. Vào `/admin/classes`
2. Click "Thêm lớp học"
3. Điền: Mã lớp, Tên lớp, Mô tả, Số SV tối đa
4. Click "Tạo lớp học"

### 2. Admin tạo sinh viên và gán vào lớp
1. Vào `/admin/users`
2. Click "Thêm người dùng"
3. Chọn role = "Học sinh"
4. Điền: Tên, Email, Mật khẩu, Mã sinh viên
5. Chọn lớp từ dropdown
6. Click "Tạo người dùng"

### 3. Admin tạo giáo viên
1. Vào `/admin/users`
2. Click "Thêm người dùng"
3. Chọn role = "Giáo viên"
4. Điền: Tên, Email, Mật khẩu, Mã giáo viên
5. Click "Tạo người dùng"

### 4. Giáo viên tạo đề thi cho lớp
1. Vào `/teacher/create-exam`
2. Điền thông tin đề thi
3. Chọn lớp từ dropdown "Lớp học"
4. Check "Công khai bài thi"
5. Thêm câu hỏi
6. Click "Tạo bài thi"

### 5. Sinh viên xem và làm bài thi
1. Vào `/student/exams`
2. Chỉ thấy đề thi của lớp mình (tự động filter)
3. Click "Bắt đầu làm bài" để làm bài thi

---

## 🔍 KIỂM TRA

### Các điểm cần kiểm tra:

1. **Admin**:
   - ✅ Tạo lớp học thành công
   - ✅ Tạo sinh viên với studentId và classId
   - ✅ Tạo giáo viên với teacherId
   - ✅ Xem danh sách sinh viên trong lớp

2. **Teacher**:
   - ✅ Tạo đề thi với classId
   - ✅ Chỉ thấy đề thi do mình tạo
   - ✅ Không thấy đề thi của giáo viên khác

3. **Student**:
   - ✅ Chỉ thấy đề thi của lớp mình
   - ✅ Chỉ thấy đề thi có isPublic = true
   - ✅ Không thấy đề thi của lớp khác
   - ✅ Có thể làm bài thi của lớp mình

---

## ⚠️ LƯU Ý

1. **Sinh viên phải có classId**: Nếu sinh viên chưa có classId, sẽ không thấy đề thi nào.

2. **Đề thi phải có isPublic = true**: Sinh viên chỉ thấy đề thi có isPublic = true.

3. **Giáo viên chỉ thấy đề thi của mình**: Backend tự động filter theo `createdBy`.

4. **Admin thấy tất cả**: Admin không bị filter, thấy tất cả dữ liệu.

---

## 🚀 BƯỚC TIẾP THEO (Tùy chọn)

1. **Cải thiện UI/UX**:
   - Thêm loading states tốt hơn
   - Thêm confirmation dialogs
   - Thêm success notifications

2. **Validation nâng cao**:
   - Validate studentId format
   - Validate teacherId format
   - Kiểm tra classId hợp lệ

3. **Tính năng bổ sung**:
   - Bulk import sinh viên vào lớp
   - Export danh sách sinh viên
   - Thống kê theo lớp

---

*Cập nhật: 2024*


