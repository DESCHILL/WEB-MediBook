# Quy trình làm việc với Git

## Phân chia công việc

Một repository chứa toàn bộ đồ án. Thư mục phân chia các phần sản phẩm; nhánh dùng cho từng thay đổi và được hợp nhất sau khi kiểm tra, không giữ các nhánh frontend/backend/báo cáo tách rời lâu dài.

- `main`: phiên bản đã kiểm tra, phù hợp để trình bày.
- Nhánh thay đổi: tên mô tả như `feature/appointment_booking`, `fix/slot_validation`, `docs/project_proposal`.
- Các nhánh do Codex tạo mặc định dùng tiền tố `codex/`, ví dụ `codex/database_schema`.

Sau commit đầu tiên và khi đã đưa repository lên GitHub, tạo nhánh cho thay đổi mới, commit phần liên quan, push nhánh rồi mở pull request vào `main`. Có thể bật bảo vệ `main` khi nhóm bắt đầu làm chung; chưa cấu hình thiết lập này trong bước chuẩn bị thư mục.

## Commit

Mỗi commit tập trung vào một mục đích. Các ví dụ:

```text
chore(repo): organize project directories
feat(database): add initial appointment schema
feat(frontend): add doctor appointment calendar
feat(backend): implement appointment cancellation
docs(report): update project proposal
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
