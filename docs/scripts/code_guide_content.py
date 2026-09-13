def write_content(document, heading, paragraph, code, table):
    heading(document, '1 Cài đặt và chuẩn bị máy trình bày')
    paragraph(document, 'Hướng dẫn này dùng cho bản mã nguồn đã hoàn thiện trên máy phát triển. Khi các đợt chưa được push, bản clone từ main chưa có đủ chức năng. Chuyển bản source đang làm sang máy trình bày, bỏ node_modules, backend/.env, backend/uploads và local_data; tạo lại cấu hình và dữ liệu demo trên máy mới.')
    table(document, ['Thành phần', 'Vai trò'], [
        ['Windows và Node.js 24', 'Chạy backend Express và frontend React Vite.'],
        ['SQL Server Express và SSMS', 'Lưu dữ liệu MediBook, chạy schema và xem ERD.'],
        ['ODBC Driver 18 for SQL Server', 'Kết nối Node.js với SQL Server qua msnodesqlv8.'],
        ['Git', 'Đọc lịch sử commit và lấy các đợt đã phát hành.'],
    ], [5, 11])
    paragraph(document, 'Mở PowerShell tại thư mục WEB-MediBook. Cài đúng thư viện trong package-lock.json rồi tạo cấu hình JWT cục bộ.')
    code(document, 'npm ci\nnpm run setup:auth')
    paragraph(document, 'Trong SSMS, kết nối bằng tài khoản có quyền tạo database. Chạy database/schema/01_create_medibook.sql trên môi trường mới, sau đó database/migrations/03_create_auth_sessions.sql. Schema dừng nếu database đã có bảng để bảo vệ dữ liệu.')
    paragraph(document, 'Mở backend/.env. Với SQL Authentication, dùng DB_AUTH=sql và điền DB_USER, DB_PASSWORD của máy trình bày; DB_SERVER phải đúng tên instance. SQL Server cần bật Mixed Mode và khởi động lại dịch vụ sau khi đổi chế độ. Tài khoản ứng dụng cần quyền đọc và ghi trong MediBook. Không đưa tài khoản SQL thực vào mã nguồn.')
    paragraph(document, 'Nếu chọn Windows Authentication, đặt DB_AUTH=windows và chạy backend dưới tài khoản Windows có quyền đọc ghi MediBook. Giữ APP_ORIGIN=http://127.0.0.1:5173 và COOKIE_SECURE=false cho demo localhost.')
    code(document, 'npm run check:database')

    document.add_page_break()
    heading(document, '2 Chạy website và trình bày các vai trò')
    paragraph(document, 'Tạo dữ liệu giả lập và tài khoản demo riêng cho máy đang chạy. Mật khẩu demo sinh ngẫu nhiên, được lưu ở local_data/demo_accounts.json và Git bỏ qua.')
    code(document, 'npm run seed:catalog\nnpm run seed:schedules\nnpm run seed:accounts')
    paragraph(document, 'Chạy hai terminal: terminal thứ nhất khởi động backend, terminal thứ hai khởi động frontend. Giữ cả hai mở trong buổi trình bày.')
    code(document, 'npm run dev:backend\nnpm run dev:frontend')
    paragraph(document, 'Hoặc chạy scripts/start_project.ps1 để mở hai tiến trình nền ẩn trên Windows. Lệnh này không tạo tác vụ khởi động cùng Windows. Nhật ký nằm trong local_data; nếu đổi backend khi chạy nền, dừng và chạy lại tiến trình tương ứng.')
    code(document, './scripts/start_project.ps1')
    table(document, ['Địa chỉ', 'Nội dung'], [
        ['http://127.0.0.1:5173', 'Trang chủ và danh sách bác sĩ chuyên khoa.'],
        ['/lich_hen', 'Lịch hẹn của bệnh nhân đã đăng nhập.'],
        ['/tai_khoan', 'Hồ sơ cá nhân bệnh nhân.'],
        ['/bac_si/lich_hen', 'Lịch tuần của bác sĩ phụ trách.'],
        ['/bac_si/benh_nhan', 'Danh sách bệnh nhân và ghi kết quả khám.'],
        ['/quan_tri', 'Dashboard và các trang quản trị.'],
    ], [8, 8])
    paragraph(document, 'Trình bày theo thứ tự: tra cứu công khai, đăng nhập bệnh nhân, chọn bác sĩ và khung giờ, đặt lịch, xem lịch. Đăng nhập bác sĩ để xem lịch phụ trách. Khi lịch đã đến giờ, lưu kết quả ngay tại Danh sách bệnh nhân. Admin có thể xem toàn bộ lịch và hủy lịch Đã đặt chưa đến giờ.')
    paragraph(document, 'Nếu không mở được trang, kiểm tra cổng 5173 và log frontend. Nếu API readiness trả 503, kiểm tra dịch vụ SQL Server, tên instance, quyền tài khoản và ODBC Driver. Nếu không có khung giờ, kiểm tra lịch làm việc và sinh khung giờ cho khoảng ngày đang chọn.')

    document.add_page_break()
    heading(document, '3 Framework và cách đọc cấu trúc mã nguồn')
    table(document, ['Thành phần', 'Cách dùng trong project'], [
        ['React và Vite', 'React ghép component, quản lý form; Vite chạy dev server và build frontend.'],
        ['Express', 'Khai báo API, middleware xác thực, phân quyền và xử lý lỗi.'],
        ['bcrypt', 'Băm mật khẩu với cost 12, kiểm tra hash khi đăng nhập.'],
        ['jsonwebtoken', 'Ký và kiểm tra JWT HS256, issuer, audience và thời hạn.'],
        ['cookie-parser và helmet', 'Đọc cookie HttpOnly và thiết lập HTTP security headers.'],
        ['express-rate-limit', 'Giới hạn tần suất thử đăng nhập và đăng ký.'],
        ['mssql và msnodesqlv8', 'Connection pool ODBC cho cả SQL và Windows Authentication.'],
        ['node:test và supertest', 'Kiểm thử service, API và tích hợp SQL.'],
    ], [5, 11])
    paragraph(document, 'Bắt đầu đọc frontend/src/app.jsx để biết URL nào mở trang nào. Thư mục pages chứa màn hình; components chứa phần dùng lại; hooks chứa trạng thái tải dữ liệu và phiên đăng nhập; services chứa lời gọi API. Điều hướng dùng đường dẫn cùng origin, không dùng React Router.')
    paragraph(document, 'Backend bắt đầu ở src/server.js, đọc môi trường và tạo app trong src/app.js. Mỗi module đi qua routes, controllers, services và repositories. Controller nhận request; Service kiểm tra nghiệp vụ; Repository chạy SQL tham số hóa. Không truy cập SQL trực tiếp từ trình duyệt.')
    paragraph(document, 'Tên hàm và file dùng snake_case. React component được import bằng alias chữ hoa khi dùng trong JSX. Các file chuẩn của công cụ như package.json và README.md giữ tên mặc định.')
    code(document, 'Frontend → Route → Middleware → Controller\n→ Service → Repository → SQL Server')

    document.add_page_break()
    heading(document, '4 Xác thực và tra cứu công khai')
    heading(document, '4 1 Đăng ký đăng nhập và phân quyền', 2)
    paragraph(document, 'auth_service.js chuẩn hóa email, kiểm tra mật khẩu và băm bcrypt. Đăng ký công khai chỉ tạo BENH_NHAN; request chứa vai trò tự chọn bị từ chối. auth_repository.js tạo TaiKhoan và BenhNhan trong cùng transaction để tránh tài khoản thiếu hồ sơ.')
    paragraph(document, 'Đăng nhập kiểm tra mật khẩu và tài khoản hoạt động, tạo JWT có sub là mã tài khoản, jti là mã phiên. Cookie medibook_session có HttpOnly và SameSite Strict. Token có hạn một giờ. Bảng PhienDangNhap giữ phiên để đăng xuất có thể vô hiệu hóa token ngay.')
    paragraph(document, 'auth_middleware.js kiểm tra JWT và phiên trong database rồi đọc vai trò hiện tại. require_roles giới hạn BENH_NHAN, BAC_SI hoặc ADMIN tùy API. Frontend ẩn màn hình không thay thế kiểm tra quyền ở Backend. create_origin_guard kiểm tra nguồn và yêu cầu JSON khi thay đổi dữ liệu.')
    heading(document, '4 2 Danh sách bác sĩ và chuyên khoa', 2)
    paragraph(document, 'catalog_repository.js chỉ lấy bác sĩ có tài khoản hoạt động và vai trò BAC_SI. Service giới hạn trường công khai, kiểm tra ID và phân trang. Danh sách không trả email riêng tư hoặc hash mật khẩu. Chuyên khoa được giữ trong URL nên tải lại và quay lại trang vẫn giữ bộ lọc.')
    paragraph(document, 'home_page.jsx dùng banner từ ảnh UI trong báo cáo. doctor_card, doctor_portrait và specialty_filter được tái sử dụng. use_catalog.js quản lý loading, lỗi, dữ liệu rỗng và hủy request cũ khi đổi bộ lọc. Ảnh chưa có dùng hình đại diện trung tính.')
    code(document, 'GET /api/specialties\nGET /api/doctors?chuyen_khoa_id=2&page=1\nGET /api/doctors/2\nGET /api/auth/me')

    document.add_page_break()
    heading(document, '5 Hồ sơ khung giờ và lịch hẹn')
    paragraph(document, 'profile_service.js cho phép sửa họ tên, điện thoại, địa chỉ, giới tính và ngày sinh. Không cho sửa vai trò, email hoặc ID tài khoản từ form. Repository dùng ID đã xác thực và cập nhật TaiKhoan cùng BenhNhan trong transaction.')
    paragraph(document, 'LichLamViec xác định bác sĩ, thứ trong tuần, giờ bắt đầu và kết thúc. Admin thêm lịch không chồng lấn và sinh khung giờ cho tối đa 31 ngày qua API. Giao diện hiện sinh 14 ngày mỗi lần. Mỗi KhungGioKham dài 30 phút, sức chứa 1. Chạy lại không sinh trùng hoặc ghi đè khung giờ đã có.')
    paragraph(document, 'appointment_repository.js tính thời gian Việt Nam từ UTC. API trả thời gian có +07:00. Truy vấn slot loại khung đã qua, đầy hoặc bác sĩ/lịch làm việc không hoạt động. Frontend chọn ngày và giờ rồi POST khung_gio_id; chủ sở hữu lấy từ phiên.')
    paragraph(document, 'Khi đặt lịch, transaction khóa khung giờ bằng UPDLOCK và HOLDLOCK, kiểm tra lại chỗ trống rồi tăng so_cho_da_dat và chèn LichHen. Unique index lịch còn hiệu lực ngăn hai lịch chiếm cùng khung giờ. Nếu bất kỳ bước nào lỗi, rollback cả hai thay đổi.')
    paragraph(document, 'Hủy lịch kiểm tra lịch thuộc bệnh nhân, trạng thái Đã đặt và chưa đến giờ bắt đầu. Sau đó cập nhật người hủy, thời điểm hủy và giảm số chỗ trong cùng transaction. Hủy lần hai không được giảm số chỗ lần nữa.')
    table(document, ['Trạng thái', 'Ý nghĩa'], [
        ['Đã đặt', 'Bệnh nhân đã giữ khung giờ.'],
        ['Đã hủy', 'Lịch bị hủy hợp lệ; chỗ được trả lại.'],
        ['Đã khám', 'Bác sĩ phụ trách đã lưu kết quả khám.'],
    ], [4, 12])

    document.add_page_break()
    heading(document, '6 Hai trang bác sĩ và các trang quản trị')
    paragraph(document, 'doctor_workspace.jsx chỉ có Quản lý lịch hẹn và Danh sách bệnh nhân. doctor_calendar.jsx hiển thị tuần từ thứ Hai đến Chủ nhật theo từng mốc giờ. Lịch lấy từ API đã lọc bằng tài khoản bác sĩ, không nhận ID bác sĩ tùy ý từ trình duyệt.')
    paragraph(document, 'Ở Danh sách bệnh nhân, result_field hiển thị ô nhập và nút Lưu kết quả khi lịch Đã đặt đã đến giờ. doctor_service.js kiểm tra nội dung tối đa 4000 ký tự. Repository kiểm tra bác sĩ phụ trách, khóa khung giờ, đổi trạng thái Đã khám và chèn KetQuaKham trong một transaction.')
    paragraph(document, 'admin_workspace.jsx ghép năm màn hình: Tổng quan, Lịch hẹn, Thêm bác sĩ, Danh sách bác sĩ và Quản lý chuyên khoa. Dashboard đọc số đếm từ SQL. Hủy lịch của Admin dùng nhánh kiểm tra quyền riêng và vẫn chỉ hủy lịch Đã đặt chưa đến giờ.')
    paragraph(document, 'Thêm bác sĩ tạo TaiKhoan vai trò BAC_SI và BacSi trong cùng transaction; mật khẩu băm trước khi ghi. Email trùng hoặc chuyên khoa không hợp lệ làm thao tác thất bại. Danh sách bác sĩ mở phần lịch làm việc ngay trong trang để cấu hình và sinh slot.')
    paragraph(document, 'Quản lý chuyên khoa có thêm, sửa và xóa. Khóa ngoại không cho xóa chuyên khoa đang được bác sĩ sử dụng. Giao diện hiển thị số bác sĩ và yêu cầu xác nhận xóa. Không có xóa dây chuyền bác sĩ hoặc lịch khám.')
    paragraph(document, 'image_upload.jsx gửi ảnh PNG hoặc JPEG tối đa 2 MB. upload_routes.js kiểm tra Admin, nguồn yêu cầu, loại và chữ ký đầu file; đặt tên UUID rồi lưu trong backend/uploads. URL ảnh được ghi vào hồ sơ bác sĩ hoặc chuyên khoa. Thư mục uploads được Git bỏ qua.')

    document.add_page_break()
    heading(document, '7 Kiểm thử và quy trình phát hành')
    code(document, 'npm test\nnpm run build\n$env:RUN_DATABASE_TESTS="true"\nnpm run test:database')
    paragraph(document, 'Các test SQL tạo dữ liệu giả có mã riêng và dọn sau khi chạy. Kiểm thử hiện bao gồm đăng ký trùng đồng thời, xác thực và thu hồi phiên, lọc bác sĩ hoạt động, đặt lịch đồng thời, quyền sở hữu, hủy và đặt lại, quyền Admin hủy lịch, ghi kết quả đúng bác sĩ và cập nhật hồ sơ.')
    paragraph(document, 'Khi sửa nghiệp vụ, cập nhật Service và test trước, sau đó kiểm tra Repository cùng UI. Ví dụ thay điều kiện hủy phải sửa cả bệnh nhân và Admin; thay trạng thái phải kiểm tra constraint SQL, danh sách lịch, kết quả khám và tài liệu.')
    paragraph(document, 'Không đưa backend/.env, tài khoản SQL thực, local_data, uploads, node_modules hoặc dữ liệu bệnh nhân thật lên Git. Dữ liệu minh họa được tạo lại từ seed. Máy trình bày phải tự tạo bí mật JWT và tài khoản demo riêng.')
    paragraph(document, 'Issue #1 đến #10 giữ nguyên lịch sử đã làm. Phần còn lại theo dõi bằng #11 hồ sơ, #13 khung giờ, #15 lịch bệnh nhân, #18 bác sĩ, #21 Admin, #29 kiểm thử demo và #30 tài liệu. Tạo branch codex/issue_<số>_<phạm_vi>, commit tiếng Việt và kiểm thử trước khi bàn giao.')
    paragraph(document, 'Có tám đợt phát hành. Mỗi lần được yêu cầu push chỉ đưa một đợt chưa phát hành sớm nhất lên GitHub, tạo PR tiếng Việt rồi hợp nhất vào main. Branch phát triển toàn bộ chức năng không được push thay cho một đợt riêng. Issue chức năng chỉ hoàn thành khi mã đã vào main.')
    paragraph(document, 'Đọc docs/project/continuation_state.md để biết trạng thái gần nhất, docs/project/release_plan.md để biết phạm vi phát hành và docs/architecture để tra cứu API. Khi chạy lại sau khi tắt máy, kiểm tra dịch vụ SQL Server rồi khởi động backend và frontend.')
