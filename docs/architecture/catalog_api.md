# API tra cứu

Các endpoint công khai, không bắt buộc đăng nhập. Trả JSON UTF-8; ID bigint dùng chuỗi. Backend dùng truy vấn tham số hóa qua ODBC cho cả Windows Authentication và SQL Authentication.

| Method | Endpoint | Kết quả |
| --- | --- | --- |
| GET | /api/specialties | {items:[{chuyen_khoa_id,ten_chuyen_khoa,mo_ta,anh_dai_dien}]} |
| GET | /api/doctors | {items:doctor[],total,page,page_size} |
| GET | /api/doctors/:doctor_id | {doctor} |

Tham số danh sách: `page` mặc định 1, từ 1 đến 10000; `page_size` mặc định 12, từ 1 đến 24; `chuyen_khoa_id` tùy chọn, số nguyên dương dạng chuỗi, không vượt SQL bigint. Không chấp nhận tham số lạ, lặp, số âm, thập phân hoặc biểu thức SQL. Thứ tự theo bac_si_id tăng dần.

```text
GET /api/doctors?chuyen_khoa_id=2&page=1&page_size=12
GET /api/doctors/2
```

`doctor` chỉ gồm bac_si_id, ho_ten, chuyen_khoa_id, ten_chuyen_khoa, anh_dai_dien, bang_cap, kinh_nghiem, gioi_thieu, dia_chi_kham, phi_kham. `phi_kham` tính bằng VND; frontend định dạng theo vi-VN. Thuộc tính chưa có có thể null. Hồ sơ có tài khoản không hoạt động hoặc vai trò không phải BAC_SI không được hiển thị.

| HTTP | Code | Trường hợp |
| --- | --- | --- |
| 400 | INVALID_ID | ID không hợp lệ |
| 400 | INVALID_PAGE | Phân trang ngoài giới hạn |
| 400 | INVALID_FILTER | Tham số không hỗ trợ |
| 404 | SPECIALTY_NOT_FOUND | Bộ lọc chuyên khoa không tồn tại |
| 404 | DOCTOR_NOT_FOUND | Không có bác sĩ công khai với ID này |
| 500 | INTERNAL_ERROR | Lỗi hệ thống; không trả SQL hoặc thông tin kết nối |

Danh sách không có kết quả trả 200 và items rỗng. Tổng và danh sách được đọc bằng hai truy vấn; trong trường hợp Admin cập nhật đồng thời số lượng có thể thay đổi giữa hai truy vấn, frontend cho phép tải lại.

Kiểm thử nhanh `npm test`, build `npm run build`. Kiểm thử SQL thật: `$env:RUN_DATABASE_TESTS='true'; npm run test:database`. Catalog test tạo fixture trong transaction, kiểm tra lọc/phân trang/ẩn bác sĩ rồi rollback toàn bộ dữ liệu fixture.
