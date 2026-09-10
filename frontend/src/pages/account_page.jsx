import Profile_page from './profile_page.jsx';
const role_names = { BENH_NHAN: 'Bệnh nhân', BAC_SI: 'Bác sĩ', ADMIN: 'Quản trị viên' };

export default function account_page({ auth }) {
    if (auth.loading) return <main className="auth_main"><p role="status">Đang tải…</p></main>;
    if (!auth.account) return <main className="auth_main"><section className="auth_card"><h1>Vui lòng đăng nhập</h1><p>Bạn cần đăng nhập để xem thông tin tài khoản.</p><a className="primary_button button_link" href="/dang_nhap">Đăng nhập</a></section></main>;
    if(auth.account.vai_tro==='BENH_NHAN') return <Profile_page/>;
    return <main className="auth_main"><section className="auth_card account_card"><h1>Tài khoản của bạn</h1><p className="subtitle">Xin chào, {auth.account.ho_ten}.</p>
        <dl><dt>Họ và tên</dt><dd>{auth.account.ho_ten}</dd><dt>Email</dt><dd>{auth.account.email}</dd><dt>Vai trò</dt><dd>{role_names[auth.account.vai_tro]}</dd></dl>
        <a className="primary_button button_link" href={auth.account.vai_tro==='ADMIN'?'/quan_tri':'/bac_si/lich_hen'}>Mở trang làm việc</a><button className="soft_button account_logout" onClick={auth.logout} disabled={auth.pending}>Đăng xuất</button>
    </section></main>;
}
