import Site_logo from './site_logo.jsx';

export default function site_header({ account, loading, path, logout, pending }) {
    const workspace=path.startsWith('/quan_tri')||['/bac_si/lich_hen','/bac_si/benh_nhan'].includes(path);
    return <header className={`site_header ${workspace?'workspace_header':''}`}>
        <a className="brand_link" href="/" aria-label="DoctorSewa - Trang chủ"><Site_logo /></a>
        {workspace?<span className="role_badge">{path.startsWith('/quan_tri')?'Admin':'Bác sĩ'}</span>:<nav className="main_navigation" aria-label="Điều hướng chính">
            <a href="/" aria-current={path === '/' ? 'page' : undefined}>TRANG CHỦ</a>
            <a href="/bac_si" aria-current={path.startsWith('/bac_si') || path === '/chuyen_khoa' ? 'page' : undefined}>BÁC SĨ VÀ CHUYÊN KHOA</a>
            <a href="/lich_hen" aria-current={path === '/lich_hen' ? 'page' : undefined}>QUẢN LÝ LỊCH HẸN</a>
        </nav>}
        {account ? <details className="account_menu"><summary aria-label={`Tài khoản ${account.ho_ten}`}>{account.ho_ten} ▾</summary><div><a href="/tai_khoan">Hồ sơ cá nhân</a><a href={account.vai_tro==='ADMIN'?'/quan_tri':account.vai_tro==='BAC_SI'?'/bac_si/lich_hen':'/lich_hen'}>{account.vai_tro==='ADMIN'?'Trang quản trị':'Quản lý lịch hẹn'}</a><button disabled={pending} onClick={logout}>Đăng xuất</button></div></details> :
            <a className="header_button" href="/dang_ky" aria-disabled={loading ? 'true' : undefined}>Tạo tài khoản</a>}
    </header>;
}
