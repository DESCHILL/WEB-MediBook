# MediBook

Đồ án website đặt lịch khám, gồm giao diện cho bệnh nhân, bác sĩ và quản trị viên.

## Trạng thái

- Đã có schema SQL Server ban đầu: 8 bảng nghiệp vụ, khóa ngoại và các ràng buộc cơ bản.
- Đã khởi tạo React/Vite và Express theo Controller → Service → Repository.
- Đã có đăng ký bệnh nhân, đăng nhập JWT, tài khoản hiện tại, đăng xuất và middleware phân quyền.
- Đã có trang chủ, danh mục chuyên khoa, danh sách/lọc/chi tiết bác sĩ, các component dùng chung và API đọc SQL Server.
- Đã có hồ sơ bệnh nhân, khung giờ 30 phút, đặt/xem/hủy lịch; hai trang bác sĩ và lưu kết quả khám; Dashboard, bác sĩ và chuyên khoa của Admin.
- Đang phát triển cục bộ theo [8 đợt bàn giao](docs/project/release_plan.md). Mỗi yêu cầu push chỉ phát hành một đợt.
- ERD đã được người dùng vẽ trong SSMS và chèn vào báo cáo Word tại `docs/reports/source/project_proposal.docx`.

## Cấu trúc repository

```text
WEB-MediBook/
├── frontend/                Giao diện và kiểm thử frontend
├── backend/                 API, nghiệp vụ và kiểm thử backend
├── database/
│   ├── schema/              Script khởi tạo cấu trúc database
│   ├── migrations/          Các thay đổi schema có thứ tự
│   ├── seeds/               Dữ liệu mẫu giả lập
│   ├── tests/               Kiểm tra database
│   └── scripts/             Công cụ chạy SQL
├── docs/
│   ├── requirements/        Phạm vi, quy tắc nghiệp vụ và SRS
│   ├── architecture/        Kiến trúc hệ thống và đặc tả API
│   ├── diagrams/            Nguồn sơ đồ và bản xuất
│   │   ├── source/
│   │   └── exports/
│   ├── ui_ux/               Thiết kế giao diện và ảnh màn hình
│   ├── reports/             Báo cáo để chỉnh sửa và bản nộp
│   │   ├── source/
│   │   └── exports/
│   └── project/             Quy trình làm việc và quản lý đồ án
└── .github/                 Mẫu issue và pull request
```

## Bắt đầu

Yêu cầu Node.js 24, SQL Server Express và Microsoft ODBC Driver 18 for SQL Server cho chế độ Windows Authentication mặc định.

Tại thư mục gốc, chạy trong PowerShell:

```powershell
npm ci
npm run setup:auth
npm run check:database
```

`setup:auth` tạo `.env` từ mẫu khi cần và giữ cấu hình sẵn có. Điền cấu hình SQL trong `.env` trước khi kiểm tra database. Nếu database chưa tồn tại, làm theo [hướng dẫn database](database/README.md); không chạy lại script tạo schema trên database hiện có.

Sau schema, chạy `database/migrations/03_create_auth_sessions.sql` để tạo bảng phiên. Nếu dùng SQL Server Authentication, cấu hình `DB_AUTH=sql`, `DB_USER` và `DB_PASSWORD` của máy đó trong `backend/.env`. Instance phải bật Mixed Mode. ODBC Driver 18 được dùng cho cả hai chế độ; không đưa tài khoản SQL thật lên Git. Tạo dữ liệu giả lập để xem giao diện bằng `npm run seed:catalog` trên database phát triển.

Mở hai terminal tại thư mục gốc:

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

- Frontend: `http://127.0.0.1:5173` — trang chủ; `/bac_si`, `/chuyen_khoa`, `/dang_nhap`, `/dang_ky`.
- Backend: `http://127.0.0.1:3000/api/health`.
- Kiểm tra SQL Server qua API: `http://127.0.0.1:3000/api/health/ready`.
- Vite chuyển tiếp `/api` đến backend, hỗ trợ gọi API cùng origin khi phát triển.

Tạo dữ liệu và ba vai trò giả lập bằng `npm run seed:catalog`, `npm run seed:schedules`, `npm run seed:accounts`. Mật khẩu riêng của máy nằm trong `local_data/demo_accounts.json`, không đưa lên Git. Khách/bệnh nhân dùng `/`, `/bac_si`, `/lich_hen`; bác sĩ dùng `/bac_si/lich_hen` và `/bac_si/benh_nhan`; Admin dùng `/quan_tri`.

Trên Windows có thể chạy `./scripts/start_project.ps1` để mở hai tiến trình nền ẩn. Xem [Word hướng dẫn chạy và đọc code](docs/reports/source/medibook_code_guide.docx), [API các trang riêng](docs/architecture/workspace_api.md) và [tiến độ](docs/project/continuation_state.md). Bản main chưa có các đợt chưa phát hành; demo trước khi push cần chuyển bản source cục bộ.

Kiểm tra bằng `npm test` và `npm run build`. Xem [kế hoạch triển khai](docs/project/implementation_plan.md), [quy trình Git](docs/project/git_workflow.md) và [hướng dẫn tài liệu](docs/README.md).

Tên file và hàm dùng `snake_case`, trừ tên bắt buộc của công cụ/framework. Xem [quy tắc đặt tên](AGENTS.md).

Chỉ lưu mã nguồn, script và tài liệu của đồ án. Không đưa mật khẩu, dữ liệu bệnh nhân thật hoặc các file dữ liệu/backup SQL Server lên Git.
