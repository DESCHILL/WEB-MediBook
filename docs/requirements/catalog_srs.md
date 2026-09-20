# SRS tra cứu chuyên khoa và bác sĩ

Đợt 2, issue #6–#10. Tác nhân: khách vãng lai hoặc người đã đăng nhập. Nguồn giao diện: ảnh trang chủ, danh sách và chi tiết bác sĩ trong PROJECT PROPOSAL, lưu tại docs/ui_ux/catalog_reference_4.png, catalog_reference_5.png, catalog_reference_6.png.

| Mã | Yêu cầu | Nghiệm thu |
| --- | --- | --- |
| CAT01 | Xem chuyên khoa | Dữ liệu SQL Server; thẻ có tên và liên kết đến danh sách lọc; không yêu cầu JWT |
| CAT02 | Danh sách bác sĩ | Bác sĩ có tài khoản hoạt động, vai trò BAC_SI; tối đa 24 hồ sơ mỗi trang; thứ tự ID ổn định |
| CAT03 | Lọc chuyên khoa | ID hợp lệ, tồn tại; URL lưu lựa chọn; chuyển bộ lọc quay lại trang đầu; có Tất cả bác sĩ |
| CAT04 | Chi tiết bác sĩ | Tên, chuyên khoa, bằng cấp, kinh nghiệm, giới thiệu, phí, địa chỉ; lỗi 404 nếu hồ sơ bị ẩn/không tồn tại |
| CAT05 | Bác sĩ liên quan | Cùng chuyên khoa, loại bác sĩ hiện tại, tối đa 5 thẻ |
| CAT06 | Trang chủ | Banner, chuyên khoa, 10 bác sĩ từ API, CTA dẫn đến danh sách và đăng ký; không dùng số lượng bác sĩ giả |
| CAT07 | Hiển thị trạng thái | Đang tải, rỗng, lỗi và Thử lại; request cũ bị hủy khi tham số thay đổi |
| CAT08 | Bảo vệ dữ liệu | Không trả email, số điện thoại tài khoản, hash, vai trò hoặc hồ sơ bệnh nhân qua API công khai |

Các thẻ không khẳng định còn khung giờ khi chưa truy vấn lịch. Form chọn ngày/giờ và nút đặt lịch sẽ được nối ở đợt 4–5. Header hiện có các đích đã hoạt động: trang chủ, bác sĩ, chuyên khoa và tài khoản. Không tạo trang bác sĩ nghiệp vụ mới ngoài hai trang đã chốt.

Seed tạo 6 chuyên khoa và 12 bác sĩ giả lập để trình bày. Hồ sơ ghi rõ dữ liệu minh họa; ảnh thiếu có hình thay thế. Seed không ghi đè tài khoản đã có, tạo mật khẩu ngẫu nhiên không xuất ra. Việc thêm bác sĩ thật thuộc module Admin.

Luồng đọc: React page → catalog_api → catalog_routes → catalog_controller → catalog_service → catalog_repository → SQL Server. Backend kiểm tra đầu vào; frontend chỉ xử lý bố cục và trạng thái. Không thay đổi schema ở đợt này.
