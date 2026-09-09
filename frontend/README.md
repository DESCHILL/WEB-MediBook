# Frontend

React 19 và Vite 8, dùng JavaScript/JSX. Hiện chỉ có trang khởi tạo; các màn hình nghiệp vụ sẽ được dựng theo UI/UX trong báo cáo.

Chạy từ gốc repository: `npm run dev:frontend` để mở `http://127.0.0.1:5173`; `npm run build` để xuất `frontend/dist/`.

File `vite_config.js` được chỉ định rõ trong npm scripts để giữ quy tắc `snake_case`. Proxy `/api` chuyển đến backend tại `127.0.0.1:3000`; nếu đổi cổng backend, cập nhật proxy cùng lúc. Khi triển khai bản build, máy chủ web cần chuyển tiếp `/api` đến backend.

Tên file và hàm tự định nghĩa dùng `snake_case`. React component được import với alias bắt đầu bằng chữ hoa khi dùng trong JSX; tên export bắt buộc của framework/thư viện giữ đúng API.

Lưu thiết kế và ảnh phục vụ báo cáo tại `docs/ui_ux/`. Không đưa mật khẩu database hoặc khóa ký JWT vào frontend; mọi biến Vite đưa vào bundle đều có thể được người dùng đọc.
