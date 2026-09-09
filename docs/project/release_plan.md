# Kế hoạch 8 đợt bàn giao

Người dùng yêu cầu tiếp tục toàn bộ đồ án, commit tiếng Việt và chỉ push từng đợt khi được yêu cầu. Mỗi chức năng có một issue trên GitHub. Tạo issue không đồng nghĩa đã push mã nguồn.

| Đợt | Phạm vi | Issue | Branch chốt đợt | Trạng thái |
| --- | --- | --- | --- | --- |
| 1 | Đăng ký, đăng nhập, tài khoản hiện tại, đăng xuất, phân quyền JWT | #1–#5 | codex/dot_01_xac_thuc | Đã có code cục bộ, chưa push |
| 2 | Chuyên khoa, bác sĩ, bộ lọc, chi tiết và trang chủ dùng component | #6–#10 | codex/dot_02_tra_cuu | Đang triển khai cục bộ |
| 3 | Xem và cập nhật hồ sơ bệnh nhân | #11–#12 | codex/dot_03_ho_so | Chưa triển khai |
| 4 | Lịch làm việc, sinh và tra cứu khung giờ 30 phút | #13–#14 | codex/dot_04_khung_gio | Chưa triển khai |
| 5 | Đặt lịch, theo dõi lịch và bệnh nhân hủy lịch | #15–#17 | codex/dot_05_lich_hen | Chưa triển khai |
| 6 | Hai trang bác sĩ và ghi nhận kết quả | #18–#20 | codex/dot_06_bac_si | Chưa triển khai |
| 7 | Dashboard, bác sĩ, lịch hẹn và chuyên khoa của Admin | #21–#28 | codex/dot_07_quan_tri | Chưa triển khai |
| 8 | Kiểm thử tích hợp, đóng gói và đồng bộ tài liệu | #29–#30 | codex/dot_08_ban_giao | Chưa triển khai |

## Cách phát triển

Mỗi issue có branch `codex/issue_<số>_<chức_năng>`. Các branch xếp nối tiếp vì chức năng sau sử dụng chức năng trước. Sau mỗi chức năng, commit tiếng Việt và kiểm tra phần thay đổi. Sau mỗi đợt, giữ một branch chốt ở đúng commit cuối của đợt; không di chuyển branch chốt này để gom thêm đợt tiếp theo.

Module xác thực đã được viết trước khi áp dụng quy trình này: commit nhập phần code có sẵn tham chiếu #1–#5, các branch issue tương ứng giữ cùng mốc nhập. Những chức năng mới từ đợt 2 được tạo branch trước khi code và có commit riêng.

`main` và `origin/main` giữ bản đã bàn giao. Các commit cục bộ không tự động được hợp nhất vào main. Khi phát triển có thể đứng trên branch chức năng mới nhất để chạy toàn bộ phần đã làm.

## Mỗi lần người dùng yêu cầu push

1. Đọc tài liệu này và lịch sử remote để xác định đợt chưa phát hành sớm nhất.
2. Kiểm tra test, build, nội dung staged và không có bí mật tại đúng branch chốt đợt.
3. Chỉ push các branch chức năng thuộc đợt đó và branch chốt tương ứng. Không push `--all`, không push branch đợt sau, không force push.
4. Tạo PR tiếng Việt từ branch chốt đợt vào main; mô tả các issue và bằng chứng kiểm thử. Hợp nhất sau khi kiểm tra xung đột và checks. Giữ các commit tiếng Việt trong lịch sử.
5. Chỉ đóng issue của đợt đã hợp nhất và cập nhật trạng thái đã phát hành. Dừng sau MỘT đợt; không tự động push tiếp.

Đợt kế tiếp được phép phát hành khi người dùng nói push: **đợt 1**. Hiện chưa có đợt nào trong bảng được push.

## Giao diện và dữ liệu

Giữ React/Vite, chia `components`, `pages`, `hooks`, `services`; không đưa mọi màn hình vào app.jsx. React yêu cầu tên component trong JSX bắt đầu bằng chữ hoa: dùng alias khi import, còn tên hàm/file tự viết vẫn snake_case. Giữ header, nền trắng, màu tím, bố cục thẻ và sidebar theo UI/UX.

Dữ liệu demo phải giả lập, có nguồn seed rõ ràng, không đặt mật khẩu đăng nhập mẫu cố định trong repo. Chức năng chưa làm không được hiển thị dữ liệu hay thông báo thành công giả. Tài liệu Word và hướng dẫn đọc code cũ được giữ để đồng bộ ở đợt 8; SRS/API được cập nhật theo từng chức năng ngay khi code.
