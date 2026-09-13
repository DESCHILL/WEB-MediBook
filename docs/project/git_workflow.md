# Quy trình làm việc với Git

## Phân chia công việc

Một repository chứa toàn bộ đồ án. Thư mục phân chia các phần sản phẩm; nhánh dùng cho từng thay đổi và được hợp nhất sau khi kiểm tra, không giữ các nhánh frontend/backend/báo cáo tách rời lâu dài.

- `main`: phiên bản đã kiểm tra, phù hợp để trình bày.
- Nhánh thay đổi: tên mô tả như `feature/appointment_booking`, `fix/slot_validation`, `docs/project_proposal`.
- Các nhánh do Codex tạo mặc định dùng tiền tố `codex/`, ví dụ `codex/database_schema`.

Thực hiện theo [kế hoạch 8 đợt](release_plan.md): mỗi phạm vi đã gộp có một issue và branch `codex/issue_<số>_<chức_năng>`. Chỉ commit cục bộ khi code; chưa push cho đến khi người dùng yêu cầu. Mỗi lần được yêu cầu push chỉ phát hành một đợt vào `main`, không push tất cả branch. Mỗi đợt có branch chốt để tránh đưa lẫn code đợt sau.

## Commit

Mỗi commit tập trung vào một mục đích. Các ví dụ:

```text
Thêm API danh mục chuyên khoa và component hiển thị (#6)
Lọc bác sĩ theo chuyên khoa và giữ lựa chọn trong URL (#8)
Hoàn thiện trang Quản lý lịch hẹn của bác sĩ (#18)
Kiểm tra quyền và giao dịch hủy lịch khám (#15)
Đồng bộ đặc tả API với báo cáo đồ án (#30)
```

Kiểm tra trước khi commit:

```bash
git status --short
git diff
git add <cac_file_lien_quan>
git diff --cached --stat
git diff --cached
```

Kiểm tra build/test theo phần thay đổi khi ứng dụng đã có. Với báo cáo, mở lại Word/PDF để kiểm tra bố cục; với database, chạy script kiểm tra trên database phát triển.

## Database

- `schema/`: cấu trúc khởi tạo cho môi trường mới.
- `migrations/`: thay đổi tiếp nối, tên như `001_add_appointment_index.sql`; đã áp dụng chung thì không sửa lại migration cũ.
- `seeds/`: chỉ dữ liệu giả lập hoặc danh mục công khai.
- Cập nhật schema, migration và tài liệu khi thay đổi mô hình dữ liệu.

## Tài liệu và bí mật

Commit Word nguồn và PDF tương ứng cùng nhau khi chốt bản nộp. Không commit file tạm, bản sao lưu, mật khẩu hay dữ liệu bệnh nhân thật. `.env.example` chỉ chứa tên biến và giá trị giả. `.gitignore` giúp lọc file nhưng không thay thế việc đọc nội dung trước khi push.

## Tự động hóa

Đã có `npm test` để kiểm thử backend và `npm run build` để build frontend. Chưa thêm workflow CI. Khi bổ sung CI, chạy hai lệnh này; tách kiểm tra SQL Server thực tế (`npm run check:database`) sang môi trường có database và driver phù hợp.
