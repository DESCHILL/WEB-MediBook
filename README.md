# MediBook

Đồ án website đặt lịch khám, gồm giao diện cho bệnh nhân, bác sĩ và quản trị viên.

## Trạng thái

- Đã có schema SQL Server ban đầu: 8 bảng nghiệp vụ, khóa ngoại và các ràng buộc cơ bản.
- Đã khởi tạo React/Vite và Express theo Controller → Service → Repository.
- Đã kiểm tra kết nối Node.js với SQL Server và hai endpoint health; chưa triển khai đăng nhập hoặc API nghiệp vụ.
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
Copy-Item backend/.env.example backend/.env
npm run check:database
```

Chỉ sao chép `.env` khi chưa có file cấu hình riêng. Nếu database chưa tồn tại, làm theo [hướng dẫn database](database/README.md); không chạy lại script tạo schema trên database hiện có.

Mở hai terminal tại thư mục gốc:

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

- Frontend: `http://127.0.0.1:5173` — hiện là trang khởi tạo, chưa phải giao diện nghiệp vụ.
- Backend: `http://127.0.0.1:3000/api/health`.
- Kiểm tra SQL Server qua API: `http://127.0.0.1:3000/api/health/ready`.
- Vite chuyển tiếp `/api` đến backend, hỗ trợ gọi API cùng origin khi phát triển.

Kiểm tra bằng `npm test` và `npm run build`. Xem [kế hoạch triển khai](docs/project/implementation_plan.md), [quy trình Git](docs/project/git_workflow.md) và [hướng dẫn tài liệu](docs/README.md).

Tên file và hàm dùng `snake_case`, trừ tên bắt buộc của công cụ/framework. Xem [quy tắc đặt tên](AGENTS.md).

Chỉ lưu mã nguồn, script và tài liệu của đồ án. Không đưa mật khẩu, dữ liệu bệnh nhân thật hoặc các file dữ liệu/backup SQL Server lên Git.
