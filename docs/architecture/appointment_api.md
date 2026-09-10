# API lịch hẹn bệnh nhân

| Phương thức | Đường dẫn | Quyền | Dữ liệu |
| --- | --- | --- | --- |
| GET | /api/doctors/:doctor_id/slots?ngay=YYYY-MM-DD | Công khai | Khung giờ còn trống theo ngày Việt Nam |
| GET | /api/appointments | BENH_NHAN | Chỉ lịch thuộc tài khoản trong JWT |
| POST | /api/appointments | BENH_NHAN | khung_gio_id dạng chuỗi số; trả 201 với lich_hen_id |
| POST | /api/appointments/:appointment_id/cancel | BENH_NHAN | JSON {}; trả 204 |

Cookie HttpOnly hoặc Bearer được kiểm tra phiên thực trong SQL Server. Dữ liệu cá nhân trả Cache-Control no-store. Backend bỏ qua ID chủ sở hữu trong URL và từ chối trường bổ sung khi đặt lịch. Thời gian trả ISO 8601 có +07:00; SQL dùng giờ Việt Nam được tính từ UTC.

Đặt lịch khóa khung giờ UPDLOCK/HOLDLOCK trong transaction, kiểm tra còn chỗ, chưa đến giờ, lịch làm việc và bác sĩ còn hoạt động. Unique index lịch còn hiệu lực là ràng buộc bảo vệ bổ sung. Hủy kiểm tra sở hữu rồi khóa khung giờ, cập nhật trạng thái và giải phóng chỗ trong cùng transaction. Hai lần hủy không giảm sức chứa hai lần.

Lỗi: 400 dữ liệu sai; 401 thiếu/không hợp lệ JWT; 403 sai vai trò/nguồn; 404 không có dữ liệu thuộc người dùng; 409 khung giờ không khả dụng hoặc không đủ điều kiện hủy. Không đưa lỗi SQL hay chuỗi kết nối vào phản hồi.

Kiểm chứng: test SQL chạy hai yêu cầu đặt đồng thời chỉ một thành công, truy cập lịch người khác thất bại, hủy hai lần bị từ chối và chỗ đã giải phóng có thể đặt lại.
