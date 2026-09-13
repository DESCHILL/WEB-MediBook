# API xác thực

Base path `/api/auth`. JSON UTF-8, response tài khoản chỉ gồm tai_khoan_id (chuỗi), email, ho_ten, vai_tro. ID SQL bigint được trả thành chuỗi để không mất chính xác trong JavaScript.

| Method | Path | Request | Thành công | Lỗi chính |
| --- | --- | --- | --- | --- |
| POST | /register | ho_ten, email, mat_khau | 201 {message, account} | 400 dữ liệu, 409 email trùng, 429 giới hạn |
| POST | /login | email, mat_khau | 200 {account, expires_in:3600}, Set-Cookie | 400, 401 sai tài khoản, 429 |
| GET | /me | Cookie phiên hoặc Bearer JWT | 200 {account} | 401 phiên/token sai |
| POST | /logout | {} và Cookie/Bearer | 204, cookie bị xóa | 401 phiên không còn hiệu lực |

Ví dụ đăng ký:

```json
{"ho_ten":"Nguyễn An","email":"an@example.test","mat_khau":"MatKhauMinhHoa!"}
```

Ví dụ lỗi:

```json
{"code":"INVALID_INPUT","message":"Vui lòng kiểm tra thông tin đã nhập.","fields":{"email":"Vui lòng nhập email hợp lệ."}}
```

Frontend không nhận token trong body login, trình duyệt gửi lại cookie cùng origin. Để thử bằng Postman, bật cookie jar. Header Authorization nếu có được ưu tiên hơn cookie; header sai trả 401. POST thiếu application/json trả 415; Origin khác APP_ORIGIN hoặc Sec-Fetch-Site=cross-site trả 403. Mọi phản hồi auth dùng Cache-Control: no-store. Lỗi nội bộ trả 500 không có câu SQL hoặc thông tin kết nối.

Luồng: Frontend → auth_routes → auth_controller → auth_service → auth_repository → SQL Server. Đăng ký không tự đăng nhập; thành công chuyển sang form đăng nhập. Vai trò lấy từ SQL Server, không tin vai trò client gửi lên. Hàm require_roles kiểm tra quyền sau create_auth_middleware.

Kiểm tra: `npm test`; SQL thật trên database phát triển: đặt RUN_DATABASE_TESTS=true rồi `npm run test:database`. Test SQL tự tạo email riêng và xóa đúng dữ liệu vừa tạo sau chạy.
