import Site_logo from './site_logo.jsx';

export default function site_header({ account, loading, path, logout, pending }) {
    return <header className="site_header">
        <a className="brand_link" href="/" aria-label="DoctorSewa - Trang chủ"><Site_logo /></a>
        <nav className="main_navigation" aria-label="Điều hướng chính">
            <a href="/" aria-current={path === '/' ? 'page' : undefined}>TRANG CHỦ</a>
            <a href="/bac_si" aria-current={path.startsWith('/bac_si') || path === '/chuyen_khoa' ? 'page' : undefined}>BÁC SĨ VÀ CHUYÊN KHOA</a>
            <a href="/lich_hen" aria-current={path === '/lich_hen' ? 'page' : undefined}>QUẢN LÝ LỊCH HẸN</a>
        </nav>
        {account ? <div className="header_account"><a href="/tai_khoan" className="account_link" aria-label={`Tài khoản ${account.ho_ten}`}>{account.ho_ten}</a><button className="header_button" disabled={pending} onClick={logout}>Đăng xuất</button></div> :
            <a className="header_button" href="/dang_ky" aria-disabled={loading ? 'true' : undefined}>Tạo tài khoản</a>}
    </header>;
}
