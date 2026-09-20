# Tự chạy MediBook không cần AI

## Máy hiện tại

SQL Server phải đang chạy. Không cần mở SSMS hoặc AI để website hoạt động. Mở PowerShell tại C:\Users\HH\WEB-MediBook. Giữ nguyên nhánh phát triển cục bộ nếu muốn xem đủ chức năng; main trên GitHub mới có đợt 1.

Cách dễ theo dõi: mở hai cửa sổ terminal, chạy lần lượt:

```powershell
cd C:\Users\HH\WEB-MediBook
npm.cmd run dev:backend
```

```powershell
cd C:\Users\HH\WEB-MediBook
npm.cmd run dev:frontend
```

Mở http://127.0.0.1:5173. Giữ hai terminal mở; nhấn Ctrl+C trong mỗi cửa sổ để dừng. Nếu đang chạy bằng script nền, sử dụng website hiện có hoặc dừng đúng tiến trình nền trước khi chuyển sang cách hai terminal, tránh trùng cổng.

Có thể dùng cách chạy nền hiện có:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start_project.ps1
```

Script bỏ qua cổng đang có tiến trình lắng nghe. Log nằm trong local_data. Các tài khoản giả lập của máy nằm trong local_data/demo_accounts.json; không đưa file này lên GitHub.

## Cài trên máy Windows khác

Cài Node.js 24 LTS (có npm), SQL Server Express, Microsoft ODBC Driver 18 for SQL Server và SSMS. VS Code dùng đọc/sửa code; Git dùng tải mã nguồn. SSMS là công cụ quản trị, SQL Server mới là dịch vụ lưu dữ liệu.

1. Chuyển source đầy đủ từ máy hiện tại hoặc clone GitHub nếu chỉ cần bản đã phát hành. Không chuyển node_modules, .env, local_data, file dữ liệu bệnh nhân hoặc thư mục .git nội bộ khi đóng gói source.
2. Mở terminal tại thư mục gốc, kiểm tra node --version, chạy npm.cmd ci.
3. Trong SSMS kết nối instance SQL của máy mới. Với database mới, chạy database/schema/01_create_medibook.sql, sau đó database/migrations/03_create_auth_sessions.sql. Không chạy lại script tạo schema trên database đã có.
4. Chạy npm.cmd run setup:auth để tạo backend/.env và khóa JWT. Chỉnh DB_SERVER, DB_DATABASE và DB_AUTH theo máy đó. Với SQL Authentication, instance phải bật Mixed Mode và khai báo DB_USER/DB_PASSWORD bằng tài khoản của máy mới. Không sao chép mật khẩu SQL máy cũ.
5. Chạy npm.cmd run check:database; chỉ tiếp tục khi kết nối thành công.
6. Nếu dùng source đầy đủ: chạy npm.cmd run seed:catalog, npm.cmd run seed:schedules rồi npm.cmd run seed:accounts để tạo dữ liệu và tài khoản giả lập. Các lệnh seed này chưa có ở main sau đợt 1.
7. Mở hai terminal chạy backend/frontend như trên, truy cập http://127.0.0.1:5173.

## Kiểm tra lỗi thường gặp

- npm không nhận diện: cài Node.js rồi mở lại terminal. Dùng npm.cmd để tránh chính sách chặn npm.ps1 của PowerShell.
- Không vào được web: kiểm tra terminal frontend và cổng 5173.
- Không kết nối SQL: kiểm tra dịch vụ SQL Server, tên instance, driver ODBC và cấu hình backend/.env.
- Cổng đang được dùng: dùng tiến trình đã chạy hoặc dừng đúng tiến trình dự án trước khi khởi động lại.
- Endpoint http://127.0.0.1:3000/api/health/ready trả database connected khi backend kết nối SQL thành công.

AI không phải thành phần của hệ thống. Website cần các tiến trình frontend, backend và dịch vụ SQL Server đang chạy.
