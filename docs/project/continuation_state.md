# Tiến độ và yêu cầu tiếp tục

## Yêu cầu đã chốt ngày 10/09/2026

- Hoàn thiện toàn bộ website trên máy, bám UI/UX báo cáo. Chưa push code; mỗi yêu cầu push chỉ phát hành một đợt theo release_plan.md.
- Giữ nguyên issue #1–#10 đã thực hiện. Phần còn lại gộp thành #11 (hồ sơ), #13 (khung giờ), #15 (lịch bệnh nhân), #18 (hai trang bác sĩ), #21 (quản trị), #29 (kiểm thử/demo), #30 (tài liệu).
- Issue nhỏ trùng phạm vi được đóng với lý do gộp, không được tính là đã hoàn thành chức năng. Branch tạo trước khi xử lý phạm vi, commit tiếng Việt.
- Khách/bệnh nhân có Trang chủ, Bác sĩ và chuyên khoa, Quản lý lịch hẹn. Chuyên khoa là bộ lọc trong danh sách bác sĩ. Tài khoản/hồ sơ nằm ở menu tài khoản. Khách tra cứu công khai; đặt và quản lý lịch riêng yêu cầu đăng nhập.
- Bác sĩ chỉ có Quản lý lịch hẹn và Danh sách bệnh nhân; ghi kết quả ngay trong danh sách.
- Khung giờ 30 phút, sức chứa 1. Khóa và kiểm tra lần cuối khi đặt; hủy lịch Đã đặt trước giờ bắt đầu, kiểm tra chủ sở hữu hoặc quyền Admin; giải phóng chỗ trong transaction. Ghi kết quả sau giờ bắt đầu bởi bác sĩ phụ trách, chuyển Đã khám.
- Tên file/hàm snake_case. Không đưa bí mật, .env, thông tin SQL thực vào Git.

## Trạng thái

Đã có code cục bộ cho JWT, tra cứu, hồ sơ bệnh nhân, lịch làm việc, sinh slot 30 phút, đặt/xem/hủy lịch, hai trang bác sĩ, lưu kết quả và năm màn hình Admin. Đã bổ sung tải ảnh PNG/JPEG cho Admin và ba tài khoản demo riêng trong local_data/demo_accounts.json.

Kiểm tra ngày 10/09/2026: 25 test API/service đạt, 4 test tích hợp SQL chạy riêng đạt, build frontend đạt. Test SQL bao gồm đặt đồng thời, hủy hai lần, quyền sở hữu, Admin hủy, ghi kết quả, cập nhật hồ sơ, CRUD chuyên khoa và thêm bác sĩ. Trình duyệt đã kiểm tra bệnh nhân đặt lịch và lịch xuất hiện ở Dashboard Admin, lịch tuần bác sĩ, lưu kết quả chuyển Đã khám. Dữ liệu demo được giữ để người dùng xem.

Word hướng dẫn đọc code đã cập nhật 7 trang, xuất PDF bằng Word và xem đủ 7 ảnh trang, không ghi chú trong Word. Bộ render mặc định thiếu LibreOffice trên Windows nên dùng Word để kiểm tra bố cục. Báo cáo nộp gốc trong Documents không bị chỉnh sửa ở lượt này.

Tiến trình chạy nền bằng scripts/start_project.ps1, địa chỉ http://127.0.0.1:5173, health/ready kết nối SQL thành công. Script không tự chạy cùng Windows. Đọc log trong local_data nếu có lỗi. Sau khi đổi backend cần khởi động lại tiến trình nền để nạp code mới.

GitHub còn 7 issue phạm vi chưa bàn giao ngoài #1–#10 được giữ nguyên. Không push, không tạo PR, main và origin/main vẫn ở 1187c4adcef90d01cb7b8930396962820d9cf1ca. Các branch phát triển có lịch sử xếp nối theo thứ tự triển khai thực tế; phải dùng các branch chốt đợt đã tách đúng phạm vi trước khi phát hành.

## Khi tiếp tục phiên làm việc

Đọc AGENTS.md, release_plan.md và git status; giữ thay đổi chưa commit. Kiểm tra tiến trình backend/frontend và SQL Server trước khi chạy lại. Tiếp tục chức năng còn thiếu, kiểm thử quyền và transaction, đối chiếu UI/UX. Cập nhật tài liệu hướng dẫn đọc code và báo cáo khi các module ổn định.

Việc mở máy hoặc mở ứng dụng không tự bảo đảm phiên tác vụ chạy lại; cần khôi phục tác vụ hoặc gửi “tiếp tục”. Không tự vượt giới hạn quyền công cụ hoặc giới hạn sử dụng.

## Cập nhật ngày 13/09/2026

- Đã tách thành công các nhánh chốt đợt 2–8; test và build từng đợt đều đạt. Đợt 1 giữ nguyên mốc e41460c.
- Các mốc đợt 2–7: 31239e8, 80564c8, 78f854f, bdc7782, 6833d9f, 2943452. Đợt 8 có toàn bộ mã nguồn và tài liệu; dùng branch codex/dot_08_ban_giao để xác định commit mới nhất.
- Branch issue #11, #13, #15, #18, #21 trỏ đúng phạm vi bàn giao. Lịch sử triển khai cũ được giữ tại codex/local_history/issue_*.
- Worktree bàn giao nằm tại local_data/release_tree, đang ở đợt 8. Không chạy lại create_release_branches.py lên worktree đã tồn tại.
- Chạy lại 4 bài kiểm thử tích hợp SQL: tất cả đạt, không bỏ qua bài nào.
- Sửa scripts/start_project.ps1 thành UTF-8 có BOM để Windows PowerShell 5.1 đọc đúng tiếng Việt và không lỗi phân tích cú pháp.
- Chưa push hoặc tạo PR; main và origin/main vẫn ở 1187c4adcef90d01cb7b8930396962820d9cf1ca. Đợt được phát hành tiếp theo khi có yêu cầu push vẫn là đợt 1.

## Phát hành đợt 1 ngày 13/09/2026

Đã push các branch issue #1–#5 và codex/dot_01_xac_thuc. PR https://github.com/DESCHILL/WEB-MediBook/pull/31 đã hợp nhất bằng merge commit 9c16ae9ae2a6d161169c7ab6c9b4f19cb80e353d; main cục bộ và origin/main đã đồng bộ. Issue #1–#5 đóng sau hợp nhất, #6–#10 giữ nguyên. Đợt 1 được kiểm tra riêng: 11 test API, 1 test SQL và build đều đạt. Không phát hành đợt 2–8. Lần push kế tiếp là đợt 2. Bản website đầy đủ vẫn trên branch phát triển cục bộ.
