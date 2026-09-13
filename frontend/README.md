# Frontend

React 19 và Vite 8, dùng JavaScript/JSX. Đã có trang chủ, chuyên khoa, danh sách/lọc/chi tiết bác sĩ và xác thực theo UI/UX trong báo cáo.

`pages/` chứa màn hình, `components/` chứa header/footer/form/thẻ bác sĩ/bộ lọc, `hooks/` quản lý phiên và tải dữ liệu, `services/` gọi API. app.jsx chỉ chọn trang và dựng bố cục chung. Điều hướng dùng link cùng origin; URL lưu chuyên khoa và phân trang, hỗ trợ tải lại và Back của trình duyệt. Máy chủ phục vụ build cần fallback URL giao diện về index.html.

Ảnh banner lấy từ ảnh UI/UX của người dùng trong báo cáo, hiển thị vùng ảnh qua SVG viewBox; chưa có file ảnh gốc tách riêng. Logo và hình thay thế được dựng bằng SVG. Thẻ bác sĩ không hiển thị còn chỗ giả; khung giờ và đặt lịch sẽ nối ở đợt 4–5.

Chạy từ gốc repository: `npm run dev:frontend` để mở `http://127.0.0.1:5173`; `npm run build` để xuất `frontend/dist/`.

File `vite_config.js` được chỉ định rõ trong npm scripts để giữ quy tắc `snake_case`. Proxy `/api` chuyển đến backend tại `127.0.0.1:3000`; nếu đổi cổng backend, cập nhật proxy cùng lúc. Khi triển khai bản build, máy chủ web cần chuyển tiếp `/api` đến backend.

Tên file và hàm tự định nghĩa dùng `snake_case`. React component được import với alias bắt đầu bằng chữ hoa khi dùng trong JSX; tên export bắt buộc của framework/thư viện giữ đúng API.

Lưu thiết kế và ảnh phục vụ báo cáo tại `docs/ui_ux/`. Không đưa mật khẩu database hoặc khóa ký JWT vào frontend; mọi biến Vite đưa vào bundle đều có thể được người dùng đọc.
