# MediBook trên SQL Server Express

Server: `.\SQLEXPRESS`

Authentication: Windows Authentication

Database: `MediBook`

Database gồm 8 bảng nghiệp vụ, 10 khóa ngoại và chỉ mục duy nhất có điều kiện để không có hai lịch chưa hủy trong cùng khung giờ.

Module JWT bổ sung bảng kỹ thuật PhienDangNhap qua `migrations/03_create_auth_sessions.sql`. Bảng này liên kết TaiKhoan, lưu thời gian UTC và hỗ trợ vô hiệu hóa JWT khi đăng xuất. Thêm bảng vào ERD triển khai khi đồng bộ tài liệu.

Máy phát triển hiện đã dùng SQL Server Authentication. Cấu hình cụ thể nằm trong backend/.env cục bộ. Hướng dẫn Windows Authentication bên dưới vẫn dùng được cho chạy schema/migration bằng tài khoản quản trị Windows. Không cấp quyền quản trị server cho tài khoản kết nối ứng dụng.

## Tạo ERD bằng SSMS

1. Kết nối đến server ở trên.
2. Refresh **Databases**, mở **MediBook**.
3. Nhấp phải **Database Diagrams → New Database Diagram**.
4. Nếu SSMS hỏi tạo các đối tượng hỗ trợ sơ đồ, chọn **Yes**.
5. Chọn cả 8 bảng, nhấn **Add**, rồi **Close**.
6. Bố trí bảng và lưu tên **ERD_MediBook** bằng Ctrl+S.

SSMS tạo các đường quan hệ từ khóa ngoại thực tế. `sysdiagrams`, nếu được SSMS tạo, là bảng hỗ trợ lưu sơ đồ, không phải bảng nghiệp vụ thứ chín.

## Các tệp

- `schema/01_create_medibook.sql`: tạo database và schema; dừng nếu database đã có bảng, không xóa dữ liệu.
- `tests/02_verify.sql`: kiểm tra thời lượng, chống đặt trùng và đặt lại sau hủy; rollback dữ liệu thử.
- `scripts/run_sql.ps1`: chạy SQL qua Windows Authentication, không chứa mật khẩu.
- `migrations/`: thay đổi schema sau khi đã có database; đặt số thứ tự và mô tả rõ.
- `seeds/`: dữ liệu mẫu giả lập, không dùng thông tin bệnh nhân thật.

Chạy từ thư mục gốc repository bằng PowerShell:

```powershell
./database/scripts/run_sql.ps1 -File ./database/schema/01_create_medibook.sql
./database/scripts/run_sql.ps1 -File ./database/tests/02_verify.sql
```

Script kiểm tra chỉ chạy trên database phát triển hoặc kiểm thử. Sau khi schema ban đầu đã được dùng chung, bổ sung migration cho từng thay đổi, không chỉ sửa script khởi tạo rồi yêu cầu mọi người tạo lại database.

## Quy ước dữ liệu

- `thu_trong_tuan`: 2 = thứ Hai, ... 7 = thứ Bảy, 8 = Chủ nhật.
- Các thời điểm lưu theo giờ địa phương của hệ thống; máy triển khai phải thống nhất múi giờ Việt Nam.
- Trạng thái lịch: `Đã đặt`, `Đã hủy`, `Đã khám`.
- Khung giờ đúng 30 phút, sức chứa bằng 1; email duy nhất.
- Một khung giờ có thể có nhiều lịch đã hủy nhưng tối đa một lịch chưa hủy.
- Một lịch hẹn có tối đa một kết quả khám.

Schema là bước chuẩn bị dữ liệu. Backend tiếp theo phải kiểm tra vai trò và quyền sở hữu, hạn hủy, thời điểm ghi nhận kết quả; sinh khung giờ nằm trong lịch làm việc và không chồng lấn. Đặt/hủy phải khóa khung giờ và cập nhật `so_cho_da_dat` cùng lịch hẹn trong một transaction. Lưu kết quả phải cập nhật trạng thái `Đã khám` trong cùng transaction. Các kiểm tra này chưa được triển khai thành API hay stored procedure trong bước tạo schema.

Database `ClinicManagement` hiện có được giữ nguyên. Người dùng đã tạo ERD bằng SSMS và chèn vào Word; `sysdiagrams` là bảng hỗ trợ của SSMS, không tính vào 8 bảng nghiệp vụ.
