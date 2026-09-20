# API hồ sơ bác sĩ và quản trị

Các API riêng kiểm tra JWT, phiên đăng nhập thực, trạng thái tài khoản và vai trò trong database. Phản hồi riêng dùng Cache-Control no-store. Các thao tác thay đổi yêu cầu JSON và kiểm tra Origin; tải ảnh dùng image/png hoặc image/jpeg.

| Phương thức | Đường dẫn | Vai trò | Nội dung |
| --- | --- | --- | --- |
| GET | /api/profile | BENH_NHAN | Hồ sơ của tài khoản hiện tại |
| PUT | /api/profile | BENH_NHAN | ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, dia_chi |
| GET | /api/doctor/appointments | BAC_SI | Lịch và bệnh nhân do bác sĩ phụ trách |
| POST | /api/doctor/appointments/:id/result | BAC_SI | noi_dung từ 1–4000 ký tự; trả 204 |
| GET | /api/admin/dashboard | ADMIN | Số bác sĩ, bệnh nhân, lịch hẹn |
| GET | /api/admin/appointments | ADMIN | Lịch toàn hệ thống |
| POST | /api/admin/appointments/:id/cancel | ADMIN | Kiểm tra quyền riêng, điều kiện hủy; trả 204 |
| GET | /api/admin/doctors | ADMIN | Danh sách quản trị không có mật khẩu |
| POST | /api/admin/doctors | ADMIN | Tạo tài khoản và hồ sơ bác sĩ; trả 201 |
| GET | /api/admin/specialties | ADMIN | Chuyên khoa và số bác sĩ |
| POST | /api/admin/specialties | ADMIN | ten_chuyen_khoa, mo_ta, anh_dai_dien; trả 201 |
| PUT | /api/admin/specialties/:id | ADMIN | Cập nhật chuyên khoa |
| DELETE | /api/admin/specialties/:id | ADMIN | Chỉ xóa khi không có bác sĩ; trả 204 |
| GET | /api/admin/doctors/:doctor_id/schedules | ADMIN | Lịch làm việc |
| POST | /api/admin/doctors/:doctor_id/schedules | ADMIN | thu_trong_tuan 2–8, gio_bat_dau, gio_ket_thuc theo HH:mm và bước 30 phút |
| POST | /api/admin/doctors/:doctor_id/slots/generate | ADMIN | ngay_bat_dau YYYY-MM-DD, so_ngay 1–31 |
| POST | /api/uploads | ADMIN | Ảnh PNG/JPEG tối đa 2 MB; trả URL cục bộ |

Tạo bác sĩ nhận ho_ten, email, mat_khau, chuyen_khoa_id, bang_cap, kinh_nghiem, gioi_thieu, dia_chi_kham, anh_dai_dien, phi_kham. Vai trò được ấn định BAC_SI trong Repository. Mật khẩu được băm bcrypt cost 12. Tên và email được kiểm tra; ảnh phải là URL /uploads do API tạo. Email trùng trả 409, chuyên khoa không hợp lệ trả 409.

Ghi kết quả kiểm tra bác sĩ sở hữu lịch, trạng thái Đã đặt và đã tới thời gian bắt đầu. Transaction lưu KetQuaKham đồng thời đổi LichHen thành Đã khám. Chức năng sửa kết quả sau khi hoàn tất không nằm trong phạm vi hiện tại.

Sinh slot đọc LichLamViec đang hoạt động, không phụ thuộc DATEFIRST của SQL Server, bỏ khung đã qua và kiểm tra khoảng chồng lấn với slot hiện có. Khóa bác sĩ tuần tự hóa các lần sinh cùng bác sĩ. Khoảng thời gian lưu theo giờ Việt Nam.

Ảnh lưu trong backend/uploads, tên UUID, không đưa lên Git. Vite proxy /uploads về Backend khi phát triển. Backend kiểm tra loại/chữ ký file và trả nosniff qua helmet. Chỉ dùng ảnh minh họa công khai cho demo.
