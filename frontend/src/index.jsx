/**
 * Entry point của ứng dụng React
 * File này khởi tạo và render ứng dụng vào DOM
 */

// Import React và ReactDOM để render ứng dụng
import React from 'react';
import ReactDOM from 'react-dom/client';
// Import component App chính của ứng dụng
import App from './App';
// Import file CSS global
import './index.css';

// Tạo root element và render ứng dụng
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode giúp phát hiện các vấn đề tiềm ẩn trong development
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 