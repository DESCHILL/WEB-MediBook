# Nghiệm thu cục bộ đợt 2

Phạm vi: #6–#10, tra cứu chuyên khoa/bác sĩ và trang chủ, chưa push. Các branch chức năng được tạo trước khi code; main giữ nguyên commit khởi tạo đã có trên GitHub.

| Kiểm tra | Kết quả |
| --- | --- |
| Unit/API | npm test: kiểm tra danh mục rỗng, lỗi DB, ID, phân trang, bộ lọc, dữ liệu công khai, chi tiết 404; bộ xác thực vẫn đạt |
| SQL thật | 2 integration test đạt qua SQL Authentication: đăng ký đồng thời/phiên; lọc/phân trang/ẩn bác sĩ |
| Build | npm run build đạt |
| API đang chạy | 6 chuyên khoa, 12 bác sĩ demo; page_size=5 trả 5; lọc một chuyên khoa trả 2; chi tiết có tên/phí/địa chỉ |
| Trình duyệt | Trang chủ → Phụ khoa → Trần Ngọc Mai; Back và reload giữ chuyen_khoa_id=3 |
| Form xác thực sau tách component | Mở đăng ký, gửi form rỗng hiển thị lỗi các trường; không gửi dữ liệu không hợp lệ |
| Hình thức | Kiểm tra trực quan trang chủ và chi tiết ở viewport desktop mặc định; chưa kiểm thử thiết bị di động thực |

Seed dùng tài khoản catalog_demo_XX@example.test, hash mật khẩu ngẫu nhiên không xuất ra. Không dùng tài khoản demo bác sĩ để đăng nhập. Test SQL tạo dữ liệu tạm riêng và cleanup/rollback. Ảnh thiếu dùng hình thay thế; banner dùng vùng ảnh từ UI nguồn của người dùng.

Đặt/hủy lịch, chọn khung giờ, hồ sơ bệnh nhân và màn hình bác sĩ/Admin chưa thuộc đợt này. Không có thao tác đặt lịch giả trên trang chi tiết. Header dẫn đến các chức năng đã hoạt động. Chưa có đợt mã nguồn nào được push kể từ mốc khởi tạo.
