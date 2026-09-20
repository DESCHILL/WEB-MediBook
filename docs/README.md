# Tài liệu đồ án

| Thư mục | Nội dung | Tên file ví dụ |
| --- | --- | --- |
| `requirements/` | Phạm vi, SRS, quy tắc nghiệp vụ đã thống nhất | `business_rules.md` |
| `architecture/` | Kiến trúc, đặc tả API, từ điển dữ liệu | `data_dictionary.md` |
| `diagrams/source/` | Nguồn chỉnh sửa sơ đồ | `appointment_sequence.drawio` |
| `diagrams/exports/` | Sơ đồ xuất để xem hoặc chèn báo cáo | `medibook_erd.png` |
| `ui_ux/` | Thiết kế, liên kết Figma, ảnh UI | `doctor_patient_list.png` |
| `reports/source/` | Bản báo cáo Word đang được duy trì | `project_proposal.docx`, `medibook_code_guide.docx` |
| `reports/exports/` | Bản PDF tương ứng để đọc/nộp | `project_proposal.pdf` |
| `project/` | Quy trình Git, kế hoạch, phân công | `git_workflow.md` |

Giữ một tên ổn định cho mỗi tài liệu. Dùng lịch sử Git để quản lý phiên bản, không tạo các file `final_2`, `final_final` hoặc đưa bản sao lưu cá nhân vào repository. Đánh dấu từng đợt nộp bằng tag/release khi cần.

Nguồn Database Diagram của SSMS được lưu trong database. Khi xuất ERD từ SSMS, lưu ảnh tại `diagrams/exports/`; schema tái tạo các bảng và quan hệ nằm tại `database/schema/`, không đưa file `.bak` vào thư mục nguồn sơ đồ.

Báo cáo Word hiện tại được lưu tại `reports/source/project_proposal.docx`. Khi chỉnh sửa bản trong repository, cần đồng bộ rõ ràng với bản làm việc trong Documents để tránh duy trì hai phiên bản khác nhau. `reports/source/medibook_code_guide.docx` là hướng dẫn kỹ thuật nội bộ: phần đầu chỉ cách chạy project trên máy khác, phần sau giải thích framework và code hiện có.
