# Quy tắc đặt tên của đồ án

- Yêu cầu của người dùng: mọi tên hàm và tên file phải tuân theo một quy tắc thống nhất trong toàn bộ đồ án.
- Quy ước mặc định: `snake_case` — chữ thường, không dấu, các từ ngăn cách bằng dấu gạch dưới; ví dụ `create_appointment`, `create_appointment.sql`.
- Tên phải mô tả rõ chức năng; dùng nhất quán một thuật ngữ cho cùng nghiệp vụ, không trộn nhiều cách viết hoặc viết tắt tùy ý.
- File SQL chạy theo thứ tự có thể dùng tiền tố số: `01_create_medibook.sql`, `02_verify.sql`.
- Giữ nguyên các tên bắt buộc hoặc tên chuẩn của công cụ/framework, như `README.md`, `AGENTS.md`, `package.json`.
- Khi đổi tên file hoặc hàm hiện có, cập nhật đồng bộ các tham chiếu, lệnh chạy, import và tài liệu liên quan.
- Nếu framework được chọn sau này yêu cầu quy ước tên khác, xác định một quy ước chung phù hợp trước khi triển khai; không tự ý trộn các kiểu tên.
