# SRS module xác thực

Phạm vi: UC đăng ký bệnh nhân, đăng nhập, đăng xuất của ba vai trò; API lấy tài khoản hiện tại và middleware phân quyền. UI nguồn: auth_reference_0.png và auth_reference_1.png trong docs/ui_ux, trích từ báo cáo của người dùng.

| Mã | Yêu cầu | Điều kiện nghiệm thu |
| --- | --- | --- |
| AUTH01 | Đăng ký công khai chỉ tạo BENH_NHAN | Từ chối trường vai_tro/role; tài khoản và hồ sơ BenhNhan được lưu cùng transaction |
| AUTH02 | Email duy nhất | Trim, chuyển chữ thường; unique SQL chặn hai yêu cầu đồng thời; API trả 409 |
| AUTH03 | Bảo vệ mật khẩu | bcrypt cost 12, tối thiểu 8 ký tự, tối đa 72 byte UTF-8, không trả hash ra API |
| AUTH04 | Đăng nhập | Kiểm tra bcrypt và hoat_dong; sai thông tin hoặc khóa tài khoản trả cùng thông báo 401 |
| AUTH05 | Phiên một giờ | JWT HS256, issuer medibook, audience medibook_web; sub là ID dạng chuỗi; jti gắn PhienDangNhap |
| AUTH06 | Đăng xuất | Xóa phiên đang dùng ở SQL và cookie; JWT cũ bị từ chối dù chưa hết hạn |
| AUTH07 | Phân quyền Backend | JWT hợp lệ và phiên còn hiệu lực; đọc lại vai trò và hoat_dong từ DB trước khi cho phép |
| AUTH08 | Chống thử liên tục | Đăng ký và đăng nhập chung giới hạn 20 lần/15 phút/IP trong một tiến trình |
| AUTH09 | Form theo UI/UX | Họ tên/email/mật khẩu khi đăng ký; email/mật khẩu khi đăng nhập; lỗi theo trường và khóa nút khi đang gửi |

JWT nằm trong cookie HttpOnly, SameSite=Strict, path=/api. Không lưu JWT vào localStorage. Production yêu cầu HTTPS và COOKIE_SECURE=true. Các POST xác thực chỉ nhận JSON, kiểm tra Origin và Sec-Fetch-Site. SQL Authentication của backend độc lập với tài khoản đăng nhập website.

Thêm bảng kỹ thuật PhienDangNhap qua migration 03_create_auth_sessions.sql: phien_id, tai_khoan_id, tao_luc, het_han_luc; thời gian phiên dùng UTC. 8 bảng nghiệp vụ giữ nguyên. ERD triển khai cần bổ sung quan hệ TaiKhoan–PhienDangNhap trong đợt tài liệu.

Các API nghiệp vụ của bác sĩ/Admin sẽ sử dụng require_roles khi được triển khai; module này chưa có các màn hình đó. Không có đổi mật khẩu, refresh token, email xác minh hoặc quên mật khẩu trong đợt 1. Giới hạn IP đang lưu trong RAM, cần shared store nếu triển khai nhiều tiến trình.
