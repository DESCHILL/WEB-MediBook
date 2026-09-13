import Site_logo from './site_logo.jsx';

export default function site_footer() {
    return <footer className="site_footer"><div className="footer_columns">
        <div><Site_logo /><p>Tìm kiếm bác sĩ và chuyên khoa phù hợp. Chủ động lựa chọn thời gian khám, theo dõi lịch hẹn và thông tin cá nhân của bạn.</p></div>
        <div><h2>KHÁM PHÁ</h2><a href="/">Trang chủ</a><a href="/bac_si">Danh sách bác sĩ</a><a href="/chuyen_khoa">Chuyên khoa</a></div>
        <div><h2>TÀI KHOẢN</h2><a href="/dang_nhap">Đăng nhập</a><a href="/dang_ky">Tạo tài khoản</a><a href="/tai_khoan">Thông tin tài khoản</a></div>
    </div><p className="copyright">DoctorSewa · Website đặt lịch khám bệnh trực tuyến</p></footer>;
}
