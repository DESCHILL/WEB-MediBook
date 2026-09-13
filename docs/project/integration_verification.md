# Kiểm chứng phiên bản cục bộ ngày 10 tháng 9 năm 2026

## Kết quả

- npm test: 25 đạt, 4 test SQL bỏ qua có chủ đích trong lệnh thường.
- RUN_DATABASE_TESTS=true với npm run test:database: 4 test tích hợp SQL đạt, không bỏ qua.
- npm run build: thành công, 49 module frontend.
- Seed lịch làm việc: lần đầu tạo 1932 slot cho 12 bác sĩ giả lập; lần chạy lại tạo 0, không sinh trùng.
- API health/ready: database connected.

## Trình duyệt

Khách mở Quản lý lịch hẹn thấy yêu cầu đăng nhập. Đăng nhập bệnh nhân trở về đúng trang lịch. Tra cứu bác sĩ, chọn khung 16:30 ngày 10/09/2026 và đặt lịch thành công; lịch xuất hiện trong trang cá nhân và Dashboard Admin. Bác sĩ demo thấy đúng lịch trong tuần 07–13/09/2026 và Danh sách bệnh nhân. Sau khi đến giờ, lưu nội dung giả lập và trạng thái chuyển Đã khám. Header gồm ba mục cho khách/bệnh nhân; trang bác sĩ chỉ có hai mục ở sidebar; Admin có năm mục.

Đã xem hình giao diện của trang lịch bệnh nhân, Dashboard, form thêm bác sĩ và lịch tuần bác sĩ. Chưa xác minh trên thiết bị di động thật; CSS có breakpoint cho màn hình nhỏ và bảng có cuộn ngang.

## Dữ liệu và bí mật

Test SQL tạo dữ liệu theo UUID và dọn bằng điều kiện riêng. Các tài khoản demo và lịch demo dùng dữ liệu giả, giữ ở database cục bộ để trình bày. Mật khẩu demo, .env và uploads được Git bỏ qua. Không ghi thông tin đăng nhập thật trong tài liệu.

## Tài liệu

medibook_code_guide.docx gồm 7 trang, được xuất PDF bằng Word rồi xem đủ 7 PNG. Phần đầu hướng dẫn cài/chạy trên máy khác, tiếp theo giải thích framework, module, transaction, phân quyền và quy trình Git. Không thêm ghi chú vào ảnh hoặc Word.
