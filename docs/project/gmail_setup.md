# Cấu hình Gmail gửi email DoctorSewa

## Thiết lập một lần

1. Dùng Gmail của người quản trị, bật Xác minh hai bước trong tài khoản Google.
2. Mở https://myaccount.google.com/apppasswords và tạo Mật khẩu ứng dụng cho DoctorSewa. Một số tài khoản tổ chức hoặc Advanced Protection không có chức năng này. Hướng dẫn Google: https://support.google.com/accounts/answer/185833.
3. Tại thư mục dự án, chạy npm.cmd run setup:email. Script chỉ thêm cấu hình còn thiếu, giữ nguyên mật khẩu và cấu hình SQL/JWT.
4. Mở backend/.env, nhập trực tiếp thông tin của máy:

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=dia_chi_gmail_cua_ban@gmail.com
SMTP_PASSWORD=mat_khau_ung_dung_16_ky_tu
SMTP_FROM=dia_chi_gmail_cua_ban@gmail.com
```

Không dùng mật khẩu đăng nhập Gmail thông thường. Bỏ dấu cách phân nhóm trong Mật khẩu ứng dụng khi nhập. Không gửi mật khẩu trong chat hoặc commit backend/.env. SMTP_FROM đặt bằng SMTP_USER khi dùng Gmail.

5. Chạy npm.cmd run check:email. Lệnh chỉ kiểm tra kết nối và xác thực SMTP, chưa gửi thư thử. Mã EAUTH thường liên quan mật khẩu/tài khoản; ETIMEDOUT/ESOCKET thường liên quan mạng hoặc cổng.
6. Khởi động lại backend để nạp cấu hình; giữ frontend và backend chạy khi kiểm tra. Nếu có thư chờ trong database, worker sẽ gửi sau khi khởi động và SMTP hợp lệ.

Khi thiếu cấu hình, đăng ký vẫn tạo tài khoản chờ xác minh và giữ thư trong hàng đợi. Không có thông báo giả rằng thư đã gửi thành công. Tài khoản chờ không đăng nhập hoặc đặt khám được.

## Kiểm tra bằng hộp thư thật

- Bệnh nhân: đăng ký bằng email nhận được thư → mở liên kết → bấm Xác minh email → đăng nhập → đặt một khung giờ → kiểm tra email thông tin lịch hẹn.
- Bác sĩ: Admin đăng nhập → Thêm bác sĩ với email nhận được thư → bác sĩ mở link → tự đặt mật khẩu → đăng nhập vào hai trang Bác sĩ.
- Chưa nhận được thư: xem Spam, dùng Gửi lại email xác minh tại trang đăng nhập. Link cũ hết hiệu lực khi đã cấp link mới.

APP_ORIGIN hiện là http://127.0.0.1:5173. Với cấu hình này, phải mở liên kết email trên chính máy chạy website. Mở trên điện thoại/laptop khác sẽ trỏ tới máy đó và không hoạt động. Khi triển khai thật cần thay APP_ORIGIN bằng địa chỉ HTTPS truy cập được và cấu hình cookie bảo mật; không chỉ đổi link trong email.

## Theo dõi hàng đợi bằng SSMS

```sql
USE MediBook;
SELECT email_id,loai,trang_thai,so_lan_thu,ma_loi,tao_luc,gui_luc
FROM dbo.HangDoiEmail
ORDER BY email_id DESC;
```

PENDING: chờ hoặc thử lại; SENDING: đang gửi; SENT: SMTP đã chấp nhận; FAILED: đã hết số lần thử; CANCELLED: liên kết chờ bị thay thế/hết hạn/đã xác minh.

Không công khai cột du_lieu: thư kích hoạt đang chờ chứa liên kết dùng một lần. Không đưa backup database vào Git. Nếu reset lịch hẹn khi có email BOOKING chờ, cần hủy các email BOOKING chờ của lịch bị xóa trong cùng transaction để tránh gửi xác nhận cho lịch đã reset.

Tài khoản demo example.test giữ để minh họa dữ liệu nhưng không nhận được email thật. Không cập nhật email_xac_minh_luc bằng SQL để giả lập xác minh trong bản dùng email thật.
