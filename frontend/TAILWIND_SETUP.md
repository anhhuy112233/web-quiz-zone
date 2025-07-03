# Tailwind CSS Setup Guide

## Tổng quan
Dự án này đã được tích hợp hoàn toàn với Tailwind CSS. Tất cả các file CSS cũ đã được xóa và thay thế bằng các class Tailwind CSS.

## Cấu hình hiện tại

### 1. Dependencies đã cài đặt
- `tailwindcss`: ^3.4.17
- `autoprefixer`: ^10.4.21
- `postcss`: ^8.5.6

### 2. File cấu hình
- `tailwind.config.js`: Cấu hình Tailwind với custom theme
- `postcss.config.js`: Cấu hình PostCSS với Tailwind plugin
- `src/index.css`: File CSS chính với Tailwind directives

### 3. Custom Theme
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        900: '#1e3a8a',
      }
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    animation: {
      'fade-in': 'fadeIn 0.5s ease-in-out',
      'slide-up': 'slideUp 0.3s ease-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
    },
  },
}
```

### 4. Custom Components trong index.css
```css
/* Custom components */
@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
  }
  
  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors;
  }
}

/* Custom utilities */
@layer utilities {
  .text-gradient {
    @apply bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent;
  }
  
  .glass-effect {
    @apply bg-white/10 backdrop-blur-md border border-white/20;
  }
}
```

## Components đã được cập nhật

### 1. Common Components
- `Button.jsx`: Sử dụng Tailwind classes với variants và sizes
- `Input.jsx`: Styled với Tailwind form classes
- `Card.jsx`: Responsive card component
- `Alert.jsx`: Alert component với icons và variants
- `Loading.jsx`: Spinner với Tailwind animations
- `Modal.jsx`: Modal component với backdrop và transitions

### 2. Layout Components
- `Header.jsx`: Navigation header với responsive design
- `Footer.jsx`: Footer với grid layout

### 3. Pages
- `Login.jsx`: Form đăng nhập với Tailwind styling
- `Register.jsx`: Form đăng ký với validation styling
- `AdminDashboard.jsx`: Dashboard với stats cards và quick actions
- `StudentDashboard.jsx`: Student dashboard với progress tracking
- `TeacherDashboard.jsx`: Teacher dashboard với exam management

## Cách sử dụng

### 1. Responsive Design
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Content */}
</div>
```

### 2. Hover Effects
```jsx
<button className="bg-blue-500 hover:bg-blue-700 transition-colors">
  Click me
</button>
```

### 3. Custom Components
```jsx
<Card title="My Card" className="bg-white">
  <p>Card content</p>
</Card>
```

### 4. Form Styling
```jsx
<input 
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  placeholder="Enter text..."
/>
```

## Lưu ý quan trọng

1. **Không sử dụng CSS cũ**: Tất cả CSS custom đã được xóa, chỉ sử dụng Tailwind classes
2. **Responsive**: Sử dụng breakpoints `sm:`, `md:`, `lg:`, `xl:` cho responsive design
3. **Dark mode**: Có thể thêm dark mode bằng cách sử dụng `dark:` prefix
4. **Custom classes**: Thêm custom classes vào `@layer components` trong `index.css`

## Development

### Chạy development server
```bash
npm run dev
```

### Build production
```bash
npm run build
```

### Lint code
```bash
npm run lint
```

## Troubleshooting

### Nếu Tailwind không hoạt động:
1. Kiểm tra `tailwind.config.js` có đúng content paths
2. Đảm bảo `index.css` được import trong `index.jsx`
3. Restart development server

### Nếu styles không apply:
1. Kiểm tra class names có đúng không
2. Đảm bảo không có CSS conflicts
3. Kiểm tra browser dev tools

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- [Tailwind UI Components](https://tailwindui.com/) 