# Kế hoạch triển khai sau ERD

Căn cứ: PROJECT PROPOSAL hiện tại chọn React, Node.js/Express, SQL Server và JWT; ERD đã được vẽ bằng SSMS và người dùng đã chèn vào báo cáo.

## 1. Khởi tạo môi trường

Đã hoàn thành khung frontend/backend, kết nối SQL Server, API kiểm tra trạng thái, kiểm thử lỗi kết nối và build frontend. Chưa có màn hình nghiệp vụ hoặc đăng nhập.

## 2. Tài khoản và phân quyền

Triển khai đăng ký bệnh nhân, đăng nhập, đăng xuất và lấy thông tin người dùng hiện tại. Mật khẩu được băm; đăng ký công khai chỉ tạo bệnh nhân. Middleware xác thực JWT và vai trò trước khi vào API được bảo vệ; Service kiểm tra quyền sở hữu trên dữ liệu.

Đối chiếu màn hình đăng nhập/đăng ký trong Word trước khi dựng frontend. Chốt thời hạn token và cơ chế đăng xuất trong đặc tả API khi triển khai module.

Điều kiện hoàn thành: đăng ký được tài khoản, email trùng bị từ chối, đăng nhập sai trả lỗi chung, không thể tự cấp quyền Admin/Bác sĩ, API được bảo vệ từ chối token sai và vai trò không phù hợp.

## 3. Danh mục và hồ sơ

Tra cứu chuyên khoa/bác sĩ công khai; bệnh nhân xem và sửa hồ sơ của mình; Admin thêm và xem bác sĩ, quản lý chuyên khoa. Xử lý chuyên khoa đang được bác sĩ tham chiếu trước khi cho phép xóa. Giao diện bám các trường và thao tác trong UI/UX.

## 4. Khung giờ và lịch hẹn

Sinh khung giờ 30 phút từ lịch làm việc đã cấu hình. Chỉ hiển thị khung giờ phù hợp để đặt. Đặt và hủy cập nhật lịch hẹn cùng số chỗ trong transaction, kiểm tra lại khung giờ dưới khóa. Kiểm thử hai yêu cầu cùng đặt một khung giờ và khả năng đặt lại sau hủy.

## 5. Hai trang bác sĩ và quản trị lịch hẹn

Bác sĩ chỉ có Quản lý lịch hẹn và Danh sách bệnh nhân theo UI đã chốt. Danh sách hỗ trợ nhập/gửi kết quả cho lịch do bác sĩ phụ trách, cập nhật Đã khám trong cùng transaction. Admin xem/hủy lịch và xem Dashboard.

## 6. Tích hợp và bàn giao

Kiểm thử xuyên suốt các vai trò, lỗi và dữ liệu đồng thời; hoàn thiện SRS/đặc tả API, đồng bộ báo cáo với triển khai và chuẩn bị demo. Chưa coi SRS hoặc Class Diagram là hoàn thành chỉ vì đã có ERD.
