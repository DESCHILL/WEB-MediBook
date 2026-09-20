# Yêu cầu chức năng triển khai cục bộ

## Khách và bệnh nhân

Ba mục điều hướng chính: Trang chủ, Bác sĩ và chuyên khoa, Quản lý lịch hẹn. Chuyên khoa là bộ lọc của danh sách bác sĩ. Tra cứu công khai; đặt/hủy/xem lịch riêng yêu cầu BENH_NHAN. Hồ sơ trong menu tài khoản, chỉ sửa thông tin của chính người đăng nhập.

Mỗi khung khám dài 30 phút, sức chứa 1. Khung được sinh từ lịch làm việc của bác sĩ, không tạo lịch giả trong Frontend. Chỗ được kiểm tra lại và giữ trong transaction. Lịch có ba trạng thái Đã đặt, Đã hủy, Đã khám. Bệnh nhân chỉ hủy lịch của mình còn Đã đặt và chưa bắt đầu; hủy giải phóng chỗ nguyên tử.

## Bác sĩ

Chỉ hai trang: Quản lý lịch hẹn và Danh sách bệnh nhân. Trang lịch hiển thị bảng tuần theo giờ. Trang bệnh nhân có mã, tên, tuổi tại ngày khám, thời gian, kết quả và trạng thái. Bác sĩ chỉ xem lịch phụ trách; chỉ ghi kết quả vào lịch Đã đặt đã đến giờ, lưu kết quả và chuyển Đã khám trong transaction. Không bổ sung quy trình Đang khám hoặc trang bệnh án riêng.

## Admin

Năm mục theo UI/UX: Tổng quan, Lịch hẹn, Thêm bác sĩ, Danh sách bác sĩ, Quản lý chuyên khoa. Số liệu đọc từ database. Admin hủy lịch với kiểm tra vai trò riêng và điều kiện trạng thái/thời gian như nghiệp vụ đã chốt. Thêm bác sĩ bao gồm tài khoản bcrypt và hồ sơ trong transaction. Chuyên khoa được thêm/sửa/xóa; từ chối xóa khi đang được bác sĩ tham chiếu. Lịch làm việc được cấu hình tại danh sách bác sĩ, khung giờ được sinh tối đa 31 ngày mỗi API request.

## Kiểm thử và vận hành

Kiểm tra dữ liệu không hợp lệ, email/tên chuyên khoa trùng, token sai, sai vai trò, truy cập đối tượng người khác, đặt đồng thời, hủy hai lần và ghi kết quả sai bác sĩ. Chạy test API, SQL và build; kiểm tra giao diện trên trình duyệt. Chỉ dùng seed và tài khoản giả lập khi demo. Không đưa bí mật hoặc database cục bộ vào Git.
