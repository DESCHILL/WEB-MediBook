# Danh sách kiểm thử DoctorSewa

## Chuẩn bị

1. Chạy `powershell -ExecutionPolicy Bypass -File scripts/start_project.ps1` tại thư mục dự án.
2. Mở `http://127.0.0.1:5173` và kiểm tra `http://127.0.0.1:3000/api/health/ready` trả `database: connected`.
3. Chuẩn bị một tài khoản Bệnh nhân, Bác sĩ và Admin đã hoạt động.
4. Dùng dữ liệu kiểm thử, không dùng thông tin bệnh nhân thật.

## Kiểm thử giao diện công khai

| Mã | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| TC01 | Mở Trang chủ | Hiển thị thanh điều hướng, danh sách chuyên khoa và bác sĩ nổi bật. |
| TC02 | Mở Bác sĩ và chuyên khoa | Hiển thị danh sách bác sĩ, phân trang và chỉ dữ liệu công khai. |
| TC03 | Chọn một chuyên khoa | Danh sách chỉ còn bác sĩ của chuyên khoa đó; URL giữ bộ lọc. |
| TC04 | Mở chi tiết bác sĩ | Hiển thị hồ sơ, địa chỉ, phí khám và lịch có thể đặt. |
| TC05 | Thu nhỏ trình duyệt | Điều hướng và các thẻ không bị che hoặc tràn màn hình. |

## Kiểm thử tài khoản và phân quyền

| Mã | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| TC06 | Đăng ký email mới | Tạo tài khoản Bệnh nhân, không tự cấp vai trò Bác sĩ hoặc Admin. |
| TC07 | Đăng nhập sai mật khẩu | Báo lỗi, không tạo phiên đăng nhập. |
| TC08 | Đăng nhập Bệnh nhân | Mở khu vực bệnh nhân; topbar có nút Tài khoản. |
| TC09 | Mở URL Admin bằng Bệnh nhân | Bị từ chối hoặc chuyển khỏi khu vực không có quyền. |
| TC10 | Đăng nhập Bác sĩ | Chỉ có Quản lý lịch hẹn và Danh sách bệnh nhân. |
| TC11 | Đăng xuất | Quay về trạng thái công khai; mở lại trang riêng yêu cầu đăng nhập. |

## Kiểm thử hồ sơ và lịch hẹn

| Mã | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| TC12 | Bệnh nhân cập nhật hồ sơ hợp lệ | Lưu thành công, tải lại vẫn thấy dữ liệu mới. |
| TC13 | Nhập ngày sinh hoặc dữ liệu không hợp lệ | Báo lỗi, không lưu dữ liệu sai. |
| TC14 | Chọn khung giờ 30 phút còn trống và đặt lịch | Tạo lịch Đã đặt, số chỗ của khung giờ tăng. |
| TC15 | Hai phiên cùng đặt một khung giờ | Chỉ một phiên thành công; phiên còn lại báo hết chỗ. |
| TC16 | Bệnh nhân hủy lịch của mình trước giờ khám | Lịch chuyển Đã hủy và khung giờ được giải phóng. |
| TC17 | Hủy lịch đã khám, đã hủy hoặc đã đến giờ | Bị từ chối; trạng thái và số chỗ giữ nguyên. |
| TC18 | Dùng ID lịch của bệnh nhân khác | Bị từ chối, không lộ dữ liệu lịch đó. |

## Kiểm thử Bác sĩ và Admin

| Mã | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| TC19 | Bác sĩ xem lịch | Chỉ thấy lịch do mình phụ trách theo ngày và giờ. |
| TC20 | Bác sĩ ghi kết quả cho lịch hợp lệ | Lưu kết quả, lịch chuyển Đã khám. |
| TC21 | Bác sĩ ghi kết quả cho lịch bác sĩ khác hoặc chưa đến giờ | Bị từ chối. |
| TC22 | Admin mở Dashboard | Hiển thị số liệu tổng quan và lịch gần đây. |
| TC23 | Admin thêm bác sĩ với email trùng | Báo lỗi, không tạo bản ghi một phần. |
| TC24 | Admin xóa chuyên khoa đang có bác sĩ | Bị từ chối để giữ toàn vẹn dữ liệu. |
| TC25 | Admin hủy lịch đủ điều kiện | Lịch Đã hủy, ghi nhận thao tác và giải phóng chỗ. |

## Quy trình ghi nhận

1. Kiểm thử từng mã theo thứ tự trên, ghi Đạt hoặc Không đạt.
2. Nếu Không đạt, ghi tài khoản thử, thao tác, kết quả thực tế và ảnh chụp lỗi.
3. Sửa lỗi rồi chạy lại đúng mã kiểm thử và các luồng liên quan.
4. Trước demo, chạy `npm test`, `npm run build` và kiểm tra API readiness.
