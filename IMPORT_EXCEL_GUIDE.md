# Hướng dẫn sử dụng tính năng Import Excel/CSV

## Tổng quan
Tính năng Import Excel/CSV cho phép giáo viên tạo đề thi nhanh chóng bằng cách upload file Excel hoặc CSV có cấu trúc câu hỏi.

## Cấu trúc file Excel/CSV

File phải có cấu trúc như sau:

| Câu hỏi | Lựa chọn A | Lựa chọn B | Lựa chọn C | Lựa chọn D | Đáp án đúng | Giải thích |
|---------|------------|------------|------------|------------|-------------|------------|
| 1 + 1 = ? | 1 | 2 | 3 | 4 | B | 1 + 1 = 2 |

### Quy tắc:
- **Câu hỏi**: Nội dung câu hỏi (bắt buộc)
- **Lựa chọn A/B/C/D**: 4 lựa chọn trả lời (bắt buộc)
- **Đáp án đúng**: A, B, C, D hoặc 1, 2, 3, 4 (bắt buộc)
- **Giải thích**: Giải thích đáp án (không bắt buộc)

## Cách sử dụng

### 1. Tạo file Excel/CSV
- Sử dụng Excel, Google Sheets hoặc bất kỳ editor nào
- Tạo file với cấu trúc như trên
- Lưu dưới định dạng .xlsx, .xls hoặc .csv

### 2. Upload file
1. Vào trang "Tạo đề thi mới"
2. Click nút "📁 Import từ Excel"
3. Chọn file Excel/CSV của bạn
4. Click "Xử lý file"

### 3. Kiểm tra và import
- Hệ thống sẽ hiển thị preview các câu hỏi
- Kiểm tra lại thông tin
- Click "Import X câu hỏi" để hoàn tất

## Tính năng

### ✅ Hỗ trợ định dạng
- Excel (.xlsx, .xls)
- CSV (.csv)
- Tối đa 5MB

### ✅ Validation
- Kiểm tra cấu trúc file
- Validate từng câu hỏi
- Hiển thị lỗi chi tiết

### ✅ Preview
- Xem trước câu hỏi trước khi import
- Hiển thị đáp án đúng
- Hiển thị giải thích

### ✅ Template mẫu
- Tải template mẫu có sẵn
- Sử dụng làm mẫu để tạo file

## Ví dụ file mẫu

```csv
Câu hỏi,Lựa chọn A,Lựa chọn B,Lựa chọn C,Lựa chọn D,Đáp án đúng,Giải thích
1 + 1 = ?,1,2,3,4,B,1 + 1 = 2
Thủ đô của Việt Nam là?,Hà Nội,TP.HCM,Đà Nẵng,Huế,A,Hà Nội là thủ đô của Việt Nam
Ai là người sáng lập Facebook?,Mark Zuckerberg,Bill Gates,Steve Jobs,Elon Musk,A,Mark Zuckerberg sáng lập Facebook năm 2004
```

## Lưu ý

1. **Đáp án đúng**: Có thể dùng A/B/C/D hoặc 1/2/3/4
2. **Giải thích**: Có thể để trống
3. **Dòng trống**: Sẽ được bỏ qua
4. **Lỗi**: Hệ thống sẽ hiển thị chi tiết lỗi ở từng dòng

## Troubleshooting

### Lỗi thường gặp:
- **"File không đúng định dạng"**: Kiểm tra cấu trúc cột
- **"Thiếu câu hỏi"**: Điền đầy đủ nội dung câu hỏi
- **"Thiếu lựa chọn"**: Điền đầy đủ 4 lựa chọn
- **"Đáp án đúng không hợp lệ"**: Chỉ dùng A/B/C/D hoặc 1/2/3/4 