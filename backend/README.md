# Backend

Express 5, JavaScript ES Modules. Các thư mục `src/controllers`, `src/services`, `src/repositories` và `src/routes` phân chia trách nhiệm theo báo cáo. `src/config` quản lý cấu hình và connection pool.

Chạy từ gốc repository: `npm run dev:backend`, `npm test`, `npm run check:database`.

Sao chép `.env.example` sang `.env` nếu chưa có. Mặc định sử dụng `.\SQLEXPRESS`, database `MediBook`, Windows Authentication qua `mssql/msnodesqlv8`. Máy cần ODBC Driver 18. `.env` đã bị loại khỏi Git.

`DB_TRUST_SERVER_CERTIFICATE=true` trong cấu hình mẫu phục vụ SQL Server Express cục bộ. Khi triển khai, dùng chứng chỉ hợp lệ và đặt giá trị này thành `false`. Với SQL Authentication, đặt `DB_AUTH=sql`, `DB_USER`, `DB_PASSWORD`; giữ thông tin đăng nhập trong `.env` cục bộ. Không đổi tài khoản hay chế độ đăng nhập SQL Server trong bước setup này.

| API | Thành công | Thất bại |
| --- | --- | --- |
| `GET /api/health` | 200, tiến trình API đang hoạt động | Không phụ thuộc database |
| `GET /api/health/ready` | 200, truy vấn SQL thành công | 503, không trả lỗi nội bộ SQL |

Hiện mới có các API kiểm tra trạng thái. Bước tiếp theo bổ sung module xác thực JWT, tài khoản và phân quyền. Service nghiệp vụ sẽ kiểm tra quyền, điều kiện và transaction; script schema/migration vẫn nằm tại `database/`.

Ứng dụng dùng `mssql` cho connection pool và truy vấn tham số hóa. Nếu tiếp tục truy vấn trực tiếp trong Repository, cần đồng bộ câu mô tả “ORM hoặc Query Builder” trong báo cáo khi cập nhật thiết kế triển khai.
