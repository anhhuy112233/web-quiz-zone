# 📚 Tổng Quan Thư Viện - Hệ Thống Thi Trắc Nghiệm Online

## 📋 Mục Lục
- [Backend Libraries](#backend-libraries)
- [Frontend Libraries](#frontend-libraries)
- [Tổng Kết Theo Nhóm Chức Năng](#tổng-kết-theo-nhóm-chức-năng)
- [Kiến Trúc Tổng Thể](#kiến-trúc-tổng-thể)

---

## 🔧 Backend Libraries (backend/package.json)

### 🔐 Dependencies (Thư viện chính)

#### 1. **bcryptjs (^2.4.3)**
- **Tác dụng**: Mã hóa mật khẩu một chiều
- **Chức năng**: 
  - Hash password trước khi lưu vào database
  - So sánh password khi đăng nhập
  - Bảo mật thông tin người dùng
- **Ví dụ sử dụng**:
  ```javascript
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // So sánh password
  const isMatch = await bcrypt.compare(password, hashedPassword);
  ```

#### 2. **cors (^2.8.5)**
- **Tác dụng**: Middleware cho phép frontend từ domain khác truy cập API
- **Chức năng**:
  - Xử lý Cross-Origin Resource Sharing (CORS)
  - Cho phép frontend (localhost:3000) gọi API backend (localhost:5000)
  - Cấu hình bảo mật cho production
- **Ví dụ sử dụng**:
  ```javascript
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : 'http://localhost:3000',
    credentials: true
  }));
  ```

#### 3. **dotenv (^16.4.5)**
- **Tác dụng**: Load biến môi trường từ file .env
- **Chức năng**:
  - Quản lý cấu hình an toàn
  - Tách biệt config theo môi trường (dev/prod)
  - Bảo vệ thông tin nhạy cảm
- **Ví dụ sử dụng**:
  ```javascript
  // .env file
  MONGODB_URI=mongodb://localhost:27017/exam-system
  JWT_SECRET=your-secret-key
  PORT=5000
  
  // Sử dụng
  process.env.MONGODB_URI
  process.env.JWT_SECRET
  ```

#### 4. **express (^4.18.2)**
- **Tác dụng**: Web framework cho Node.js
- **Chức năng**:
  - Tạo REST API
  - Xử lý HTTP requests/responses
  - Routing và middleware
  - Static file serving
- **Ví dụ sử dụng**:
  ```javascript
  const app = express();
  app.get('/api/users', userController);
  app.use('/api/auth', authRoutes);
  app.use(middleware);
  ```

#### 5. **jsonwebtoken (^9.0.2)**
- **Tác dụng**: Tạo và xác thực JWT (JSON Web Tokens)
- **Chức năng**:
  - Authentication và authorization
  - Tạo token khi đăng nhập
  - Verify token trong middleware
  - Stateless authentication
- **Ví dụ sử dụng**:
  ```javascript
  // Tạo token
  const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '1d' });
  
  // Verify token
  const decoded = jwt.verify(token, secret);
  ```

#### 6. **mongoose (^8.1.3)**
- **Tác dụng**: ODM (Object Document Mapper) cho MongoDB
- **Chức năng**:
  - Tương tác với MongoDB database
  - Định nghĩa schema và validation
  - Relationships giữa collections
  - Query building và aggregation
  - Middleware và hooks
- **Ví dụ sử dụng**:
  ```javascript
  // Kết nối database
  mongoose.connect(process.env.MONGODB_URI);
  
  // Tạo document
  const user = await User.create({ name, email, password });
  
  // Query với populate
  const exam = await Exam.findById(id).populate('createdBy');
  ```

#### 7. **multer (^2.0.1)**
- **Tác dụng**: Middleware xử lý file upload
- **Chức năng**:
  - Nhận file từ form data
  - Lưu file vào disk hoặc memory
  - Validate file type và size
  - Xử lý multiple files
- **Ví dụ sử dụng**:
  ```javascript
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      // Validate file type
    }
  });
  
  router.post('/upload', upload.single('file'), controller);
  ```

#### 8. **socket.io (^4.7.4)**
- **Tác dụng**: Real-time communication
- **Chức năng**:
  - WebSocket cho real-time features
  - Chat và notification
  - Real-time monitoring
  - Room management
- **Ví dụ sử dụng**:
  ```javascript
  // Server
  io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
    });
    
    socket.emit('notification', { message: 'New exam available' });
  });
  ```

#### 9. **validator (^13.11.0)**
- **Tác dụng**: Thư viện validate dữ liệu
- **Chức năng**:
  - Kiểm tra email, URL, phone number
  - Custom validation rules
  - Sanitize input data
  - Mongoose integration
- **Ví dụ sử dụng**:
  ```javascript
  // Mongoose schema validation
  email: {
    type: String,
    validate: [validator.isEmail, 'Email không hợp lệ']
  }
  
  // Custom validation
  if (!validator.isLength(password, { min: 6 })) {
    throw new Error('Password phải có ít nhất 6 ký tự');
  }
  ```

#### 10. **xlsx (^0.18.5)**
- **Tác dụng**: Xử lý file Excel (.xlsx, .xls, .csv)
- **Chức năng**:
  - Đọc file Excel
  - Parse dữ liệu từ Excel
  - Import danh sách câu hỏi
  - Export kết quả thi
- **Ví dụ sử dụng**:
  ```javascript
  // Đọc file Excel
  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  ```

### 🔧 DevDependencies (Thư viện phát triển)

#### 11. **nodemon (^3.0.3)**
- **Tác dụng**: Tự động restart server khi có thay đổi code
- **Chức năng**:
  - Development tool
  - Hot reload cho backend
  - Không cần restart thủ công
- **Script**: `"dev": "nodemon src/index.js"`

---

## ⚛️ Frontend Libraries (frontend/package.json)

### 🔐 Dependencies (Thư viện chính)

#### 1. **axios (^1.6.7)**
- **Tác dụng**: HTTP client để gọi API
- **Chức năng**:
  - Gửi HTTP requests đến backend
  - Xử lý responses và errors
  - Request/response interceptors
  - Automatic JSON parsing
- **Ví dụ sử dụng**:
  ```javascript
  // GET request
  const response = await axios.get('/api/exams');
  
  // POST request
  const result = await axios.post('/api/auth/login', {
    email: 'user@example.com',
    password: 'password'
  });
  
  // Interceptors
  axios.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  ```

#### 2. **react (^18.2.0)**
- **Tác dụng**: JavaScript library để xây dựng UI
- **Chức năng**:
  - Component-based architecture
  - State management
  - Virtual DOM
  - JSX syntax
  - Hooks (useState, useEffect, etc.)
- **Ví dụ sử dụng**:
  ```javascript
  import React, { useState, useEffect } from 'react';
  
  function App() {
    const [data, setData] = useState([]);
    
    useEffect(() => {
      // Fetch data
    }, []);
    
    return <div>Hello World</div>;
  }
  ```

#### 3. **react-dom (^18.2.0)**
- **Tác dụng**: React renderer cho web
- **Chức năng**:
  - Render React components vào DOM
  - Hydration cho SSR
  - Portal rendering
- **Ví dụ sử dụng**:
  ```javascript
  import ReactDOM from 'react-dom/client';
  
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
  ```

#### 4. **react-router-dom (^6.22.1)**
- **Tác dụng**: Routing cho React app
- **Chức năng**:
  - Client-side routing
  - URL management
  - Navigation between pages
  - Route protection
  - Nested routes
- **Ví dụ sử dụng**:
  ```javascript
  import { BrowserRouter, Routes, Route } from 'react-router-dom';
  
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/exams/:id" element={<ExamDetail />} />
    </Routes>
  </BrowserRouter>
  ```

#### 5. **socket.io-client (^4.8.1)**
- **Tác dụng**: Client-side Socket.IO
- **Chức năng**:
  - Kết nối real-time với backend
  - Nhận và gửi messages
  - Event handling
  - Room management
- **Ví dụ sử dụng**:
  ```javascript
  import { io } from 'socket.io-client';
  
  const socket = io('http://localhost:5000');
  
  socket.emit('join-room', roomId);
  socket.on('notification', (data) => {
    console.log('New notification:', data);
  });
  ```

### 🔧 DevDependencies (Thư viện phát triển)

#### 6. **@types/react (^19.1.8)**
- **Tác dụng**: TypeScript definitions cho React
- **Chức năng**:
  - IntelliSense support
  - Type checking cho React components
  - Better development experience

#### 7. **@types/react-dom (^19.1.6)**
- **Tác dụng**: TypeScript definitions cho React DOM
- **Chức năng**:
  - Type support cho React DOM methods
  - IntelliSense cho DOM operations

#### 8. **@vitejs/plugin-react (^4.5.2)**
- **Tác dụng**: Vite plugin cho React
- **Chức năng**:
  - Hot reload cho React components
  - JSX transformation
  - Fast refresh
  - Development optimization

#### 9. **autoprefixer (^10.4.21)**
- **Tác dụng**: CSS vendor prefixing
- **Chức năng**:
  - Tự động thêm vendor prefixes
  - Cross-browser compatibility
  - PostCSS integration
- **Ví dụ**: `-webkit-`, `-moz-`, `-ms-` prefixes

#### 10. **eslint (^9.29.0)**
- **Tác dụng**: Code linting tool
- **Chức năng**:
  - Kiểm tra code quality
  - Enforce coding standards
  - Find potential errors
  - Consistent code style
- **Script**: `"lint": "eslint . --ext js,jsx"`

#### 11. **eslint-plugin-react (^7.37.5)**
- **Tác dụng**: ESLint plugin cho React
- **Chức năng**:
  - React-specific linting rules
  - Best practices enforcement
  - Component validation

#### 12. **eslint-plugin-react-hooks (^5.2.0)**
- **Tác dụng**: ESLint plugin cho React Hooks
- **Chức năng**:
  - Kiểm tra rules của hooks
  - Dependency array validation
  - Hook usage best practices

#### 13. **eslint-plugin-react-refresh (^0.4.20)**
- **Tác dụng**: ESLint plugin cho React Fast Refresh
- **Chức năng**:
  - Hỗ trợ hot reload
  - Development optimization
  - Fast refresh compatibility

#### 14. **postcss (^8.5.6)**
- **Tác dụng**: CSS processing tool
- **Chức năng**:
  - Transform CSS với plugins
  - Autoprefixer integration
  - Tailwind CSS processing
  - CSS optimization

#### 15. **tailwindcss (^3.4.17)**
- **Tác dụng**: Utility-first CSS framework
- **Chức năng**:
  - Rapid UI development
  - Responsive design
  - Utility classes
  - Custom design system
- **Ví dụ sử dụng**:
  ```javascript
  <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md hover:bg-blue-600">
    Button
  </div>
  ```

#### 16. **vite (^5.2.0)**
- **Tác dụng**: Build tool và development server
- **Chức năng**:
  - Fast development server
  - Hot module replacement
  - Bundling và optimization
  - Plugin system
- **Scripts**:
  - `"dev": "vite"` - Development server
  - `"build": "vite build"` - Production build
  - `"preview": "vite preview"` - Preview production build

---

## 📊 Tổng Kết Theo Nhóm Chức Năng

### 🔐 **Authentication & Security**
- `bcryptjs` - Mã hóa mật khẩu
- `jsonwebtoken` - JWT authentication
- `validator` - Input validation

### 🗄️ **Database & ORM**
- `mongoose` - MongoDB ODM

### 🌐 **Web Framework & API**
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables

### 📁 **File Handling**
- `multer` - File upload middleware
- `xlsx` - Excel file processing

### ⚡ **Real-time Communication**
- `socket.io` (backend) - WebSocket server
- `socket.io-client` (frontend) - WebSocket client

### ⚛️ **React Ecosystem**
- `react` - UI library
- `react-dom` - React renderer
- `react-router-dom` - Client-side routing

### 🌐 **HTTP Client**
- `axios` - HTTP requests

### 🎨 **Styling & CSS**
- `tailwindcss` - Utility-first CSS framework
- `autoprefixer` - CSS vendor prefixing
- `postcss` - CSS processing

### 🛠️ **Development Tools**
- `vite` - Build tool và dev server
- `nodemon` - Auto-restart server
- `eslint` + plugins - Code linting

### 📝 **TypeScript Support**
- `@types/react` - React TypeScript definitions
- `@types/react-dom` - React DOM TypeScript definitions

---

## 🏗️ Kiến Trúc Tổng Thể

```
┌─────────────────┐    HTTP/WebSocket    ┌─────────────────┐
│   Frontend      │ ◄──────────────────► │    Backend      │
│   (React)       │                      │   (Express)     │
│                 │                      │                 │
│ • React         │                      │ • Express       │
│ • React Router  │                      │ • Mongoose      │
│ • Axios         │                      │ • Socket.IO     │
│ • Socket.IO     │                      │ • JWT           │
│ • Tailwind CSS  │                      │ • bcrypt        │
└─────────────────┘                      └─────────────────┘
                                                │
                                                ▼
                                        ┌─────────────────┐
                                        │    MongoDB      │
                                        │   Database      │
                                        │                 │
                                        │ • Users         │
                                        │ • Exams         │
                                        │ • Results       │
                                        └─────────────────┘
```

### 🔄 **Luồng Dữ Liệu**

1. **Frontend** (React + Axios) → Gửi HTTP requests
2. **Backend** (Express) → Xử lý requests
3. **Database** (MongoDB + Mongoose) → Lưu trữ dữ liệu
4. **Real-time** (Socket.IO) → Thông báo real-time
5. **Authentication** (JWT + bcrypt) → Bảo mật

### 🎯 **Tính Năng Chính**

- ✅ **User Authentication** (JWT + bcrypt)
- ✅ **Exam Management** (CRUD operations)
- ✅ **Real-time Features** (Socket.IO)
- ✅ **File Upload** (Excel import)
- ✅ **Responsive UI** (Tailwind CSS)
- ✅ **Client-side Routing** (React Router)
- ✅ **API Integration** (Axios)
- ✅ **Database Operations** (Mongoose)

---

## 📝 **Ghi Chú**

- Tất cả thư viện được cập nhật đến phiên bản mới nhất (2024)
- Kiến trúc theo mô hình MVC (Model-View-Controller)
- Hỗ trợ development và production environments
- Tích hợp đầy đủ cho ứng dụng thi trắc nghiệm online
- Có thể deploy lên Vercel (frontend) và Render (backend) 