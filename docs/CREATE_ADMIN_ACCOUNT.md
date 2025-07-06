# 🔧 Hướng Dẫn Tạo Tài Khoản Admin Trực Tiếp Trên MongoDB Atlas

## 📋 Tổng Quan
Hướng dẫn tạo tài khoản admin trực tiếp trên MongoDB Atlas để bypass lỗi đăng ký từ frontend.

## 🗄️ Bước 1: Truy Cập MongoDB Atlas

1. Đăng nhập vào [MongoDB Atlas](https://cloud.mongodb.com)
2. Chọn cluster của bạn
3. Click "Browse Collections"
4. Chọn database `exam-system` (hoặc tên database của bạn)
5. Chọn collection `users`

## 👤 Bước 2: Tạo Tài Khoản Admin

### **Cách 1: Sử dụng MongoDB Compass (Khuyến nghị)**

1. **Tải MongoDB Compass**: [Download MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. **Kết nối**: Sử dụng connection string từ MongoDB Atlas
3. **Tạo document mới** trong collection `users`:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8O",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### **Cách 2: Sử dụng MongoDB Atlas Web Interface**

1. Click "Insert Document"
2. Chọn "JSON" view
3. Paste JSON sau:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8O",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### **Cách 3: Sử dụng MongoDB Shell**

```javascript
// Kết nối đến database
use exam-system

// Tạo tài khoản admin
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8O",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## 🔑 Thông Tin Đăng Nhập

### **Tài Khoản Admin Mẫu:**
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: `admin`

### **Tạo Password Hash Mới:**

Nếu muốn tạo password khác, sử dụng script Node.js:

```javascript
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log('Hashed password:', hashedPassword);
}

hashPassword('your-new-password');
```

## 👨‍🏫 Tạo Tài Khoản Teacher

```json
{
  "name": "Teacher User",
  "email": "teacher@example.com",
  "password": "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8O",
  "role": "teacher",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 👨‍🎓 Tạo Tài Khoản Student

```json
{
  "name": "Student User",
  "email": "student@example.com",
  "password": "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8O",
  "role": "student",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔍 Kiểm Tra Tài Khoản

Sau khi tạo, kiểm tra bằng cách:

1. **Xem danh sách users**:
```javascript
db.users.find({}, {password: 0})  // Không hiển thị password
```

2. **Tìm user theo email**:
```javascript
db.users.findOne({email: "admin@example.com"})
```

## 🚨 Lưu Ý Bảo Mật

1. **Đổi password ngay** sau khi đăng nhập lần đầu
2. **Xóa tài khoản test** sau khi hoàn thành
3. **Sử dụng password mạnh** trong production
4. **Backup database** thường xuyên

## 🐛 Troubleshooting

### **Lỗi "Email đã tồn tại"**
```javascript
// Xóa user cũ nếu cần
db.users.deleteOne({email: "admin@example.com"})
```

### **Lỗi "Invalid password hash"**
- Đảm bảo password đã được hash bằng bcrypt
- Sử dụng salt rounds = 12
- Kiểm tra format của hash

### **Lỗi "Role không hợp lệ"**
- Chỉ sử dụng: `admin`, `teacher`, `student`
- Đảm bảo chữ thường

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra connection string
2. Verify database và collection names
3. Check MongoDB Atlas network access
4. Review error logs

---

**Happy Admin Creation! 🎉** 