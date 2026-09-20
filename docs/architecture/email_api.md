# Xác minh email và thông báo đặt khám

## Quy tắc

Kiểm tra định dạng email không chứng minh hộp thư có thật. Tài khoản Bệnh nhân/Bác sĩ phải mở liên kết một lần gửi đến hộp thư để xác minh quyền truy cập. Xác minh không chứng minh danh tính hoặc bằng cấp bác sĩ. Admin là người tạo và kiểm soát vai trò Bác sĩ; đăng ký công khai chỉ tạo Bệnh nhân.

Tài khoản cũ chưa có email_xac_minh_luc cũng phải xác minh. Tài khoản demo dùng example.test không được tự đánh dấu đã xác minh. Admin được giữ quyền quản trị để tạo và hỗ trợ tài khoản. JWT đã cấp cho bệnh nhân/bác sĩ chưa xác minh bị từ chối ở lần gọi API kế tiếp.

## API

| Phương thức | Đường dẫn | Dữ liệu | Kết quả |
| --- | --- | --- | --- |
| POST | /api/auth/register | ho_ten, email, mat_khau | 201: tài khoản chờ xác minh, email đã vào hàng đợi |
| POST | /api/auth/login | email, mat_khau | 403 EMAIL_NOT_VERIFIED nếu đúng mật khẩu nhưng chưa xác minh |
| POST | /api/auth/email/resend | email | 202 với cùng thông báo dù không có tài khoản; một liên kết mới mỗi 60 giây cho mỗi tài khoản |
| POST | /api/auth/email/verify | token | 200 xác minh bệnh nhân; 400 nếu sai/hết hạn/đã dùng |
| POST | /api/auth/email/activate-doctor | token, mat_khau | 200 xác minh bác sĩ và đặt mật khẩu; token bệnh nhân không dùng được ở đây |
| POST | /api/admin/doctors | các trường bác sĩ, không có mat_khau | Admin tạo tài khoản và email mời trong cùng transaction |
| POST | /api/appointments | khung_gio_id | Tạo lịch, giữ slot và email xác nhận trong cùng transaction |

Ba endpoint email giới hạn 10 yêu cầu/15 phút/IP, kiểm tra Origin và JSON. Liên kết có 32 byte ngẫu nhiên, hạn 24 giờ, chỉ dùng một lần. Bảng XacMinhEmail chỉ lưu SHA-256 của token. Link chứa token ở fragment để không nằm trong request URL gửi đến web server; giao diện xóa fragment khỏi thanh địa chỉ sau khi đọc. GET không kích hoạt tài khoản để tránh phần mềm quét email tự sử dụng liên kết.

## Hàng đợi

HangDoiEmail lưu email cùng giao dịch tạo bệnh nhân/bác sĩ/lịch hẹn. SMTP được xử lý sau khi commit; lỗi gửi không hoàn tác lịch đã đặt và không trả lỗi đặt khám khiến bệnh nhân thử lại.

Worker trong backend chạy mỗi 10 giây, lấy một email bằng khóa SQL và lease UUID trong 5 phút. Worker cũ không được cập nhật kết quả nếu lease đã chuyển. SMTP lỗi được thử lại theo khoảng tăng dần, tối đa 8 lần trước trạng thái FAILED; không log địa chỉ, nội dung thư, token hoặc mật khẩu SMTP. Liên kết chưa gửi đã hết hạn được hủy; gửi lại tạo liên kết mới và hủy thư chờ cũ. Payload chứa liên kết được xóa sau khi gửi thành công hoặc hủy.

SENT chỉ có nghĩa SMTP đã chấp nhận email, không bảo đảm người nhận đã đọc hoặc thư không vào Spam. Nếu tiến trình dừng ngay sau khi SMTP chấp nhận nhưng trước khi ghi SENT, email có thể được gửi lại; dùng Message-ID cố định nhưng không cam kết exactly-once qua SMTP.

Email đặt khám chứa mã lịch, bác sĩ, chuyên khoa, thời điểm giờ Việt Nam, thời lượng 30 phút, địa chỉ và link xem trạng thái hiện tại. Không gửi nội dung kết quả khám qua email. Thư xác nhận ghi nhận thời điểm đặt; trạng thái hiện tại được tra cứu trên website nếu sau đó lịch bị hủy.

## Dữ liệu và triển khai

Chạy database/migrations/04_email_verification.sql sau migration 03. Migration không xóa dữ liệu và không tự xác minh tài khoản cũ. Bổ sung cột TaiKhoan.email_xac_minh_luc và hai bảng kỹ thuật XacMinhEmail, HangDoiEmail. Bản ERD/Word xuất trước tính năng này cần được cập nhật khi đồng bộ báo cáo; không sử dụng hình cũ để khẳng định đã mô tả các bảng mới.

Các nhánh bàn giao 1–7 đã chốt được giữ nguyên. Chức năng email bổ sung ở đợt 8, branch codex/issue_29_email_verification, chưa push. Sau mỗi lần khôi phục database từ .bak cũ phải áp dụng migration mới. File Git bundle và .bak đã tạo trước tính năng email không chứa bản cập nhật này.
