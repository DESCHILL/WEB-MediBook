# Quy tắc đặt tên của đồ án

- Yêu cầu của người dùng: mọi tên hàm và tên file phải tuân theo một quy tắc thống nhất trong toàn bộ đồ án.
- Quy ước mặc định: `snake_case` — chữ thường, không dấu, các từ ngăn cách bằng dấu gạch dưới; ví dụ `create_appointment`, `create_appointment.sql`.
- Tên phải mô tả rõ chức năng; dùng nhất quán một thuật ngữ cho cùng nghiệp vụ, không trộn nhiều cách viết hoặc viết tắt tùy ý.
- File SQL chạy theo thứ tự có thể dùng tiền tố số: `01_create_medibook.sql`, `02_verify.sql`.
- Giữ nguyên các tên bắt buộc hoặc tên chuẩn của công cụ/framework, như `README.md`, `AGENTS.md`, `package.json`.
- Khi đổi tên file hoặc hàm hiện có, cập nhật đồng bộ các tham chiếu, lệnh chạy, import và tài liệu liên quan.
- Nếu framework được chọn sau này yêu cầu quy ước tên khác, xác định một quy ước chung phù hợp trước khi triển khai; không tự ý trộn các kiểu tên.

# Quy trình phát triển và bàn giao

- Tiếp tục hoàn thiện toàn bộ đồ án theo UI/UX trong báo cáo, chia giao diện thành các React component dùng lại; giữ tên file và hàm snake_case, import component bằng alias chữ hoa khi JSX yêu cầu.
- Có 8 đợt bàn giao theo docs/project/release_plan.md. Mỗi chức năng có một GitHub issue và branch codex/issue_<so>_<chuc_nang>.
- Commit bằng tiếng Việt, ghi số issue liên quan; chỉ stage file thuộc chức năng đang làm.
- Chưa push nếu người dùng chưa yêu cầu. Mỗi lần người dùng nói push chỉ phát hành MỘT đợt chưa phát hành sớm nhất, sau khi kiểm tra.
- Giữ main ở bản đã bàn giao. Các chức năng phát triển trên nhánh xếp nối tiếp; lưu ranh giới đợt bằng branch codex/dot_<so>_<ten>. Không push nhánh cuối chứa tất cả các đợt khi mới được phép push một đợt.
- Khi được yêu cầu push: push các branch chức năng thuộc đúng đợt, tạo PR tiếng Việt rồi hợp nhất đợt đó vào main; không force push. Issue chỉ đóng khi phần tương ứng đã vào main trên GitHub.
- Không đưa backend/.env, tài khoản SQL thực, dữ liệu bệnh nhân thật hoặc dữ liệu cục bộ lên Git.
