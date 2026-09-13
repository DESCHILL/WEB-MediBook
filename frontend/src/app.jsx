import { useEffect as use_effect, useState as use_state } from 'react';
import { send_auth_request } from './services/auth_api.js';

function current_page() { return window.location.pathname === '/dang_ky' ? 'register' : 'login'; }

function render_logo() {
    return <span className="brand">
        <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 25 10 12C1 2 19-4 24 7c6-11 24-5 15 5Z" fill="currentColor"/><path d="m12 13 6 0 3-7 4 14 4-7h8" fill="none" stroke="white" strokeWidth="2.4" strokeLinejoin="round"/><path d="M2 36c4-8 8-9 14-6l7 3h7c5 0 5 5 0 6H19l1 2h11l12-7c5-2 7 2 3 5L31 47H16L2 42Z" fill="currentColor"/></svg>
        <span><strong>DoctorSewa</strong><small>YOUR HEALTH OUR SERVICE</small></span>
    </span>;
}

const role_names = { BENH_NHAN: 'Bệnh nhân', BAC_SI: 'Bác sĩ', ADMIN: 'Quản trị viên' };

export default function app() {
    const [page, set_page] = use_state(current_page);
    const [account, set_account] = use_state(null);
    const [loading, set_loading] = use_state(true);
    const [pending, set_pending] = use_state(false);
    const [email, set_email] = use_state('');
    const [ho_ten, set_ho_ten] = use_state('');
    const [mat_khau, set_mat_khau] = use_state('');
    const [error, set_error] = use_state('');
    const [fields, set_fields] = use_state({});
    const [notice, set_notice] = use_state('');

    use_effect(() => {
        let active = true;
        send_auth_request('me').then((data) => { if (active) set_account(data.account); }).catch((failure) => {
            if (active && failure.status !== 401) set_error(failure.message);
        }).finally(() => { if (active) set_loading(false); });
        function sync_page() { set_page(current_page()); set_error(''); set_notice(''); set_fields({}); set_mat_khau(''); }
        window.addEventListener('popstate', sync_page);
        return () => { active = false; window.removeEventListener('popstate', sync_page); };
    }, []);

    function navigate(next_page) {
        if (pending) return;
        window.history.pushState({}, '', next_page === 'register' ? '/dang_ky' : '/dang_nhap');
        set_page(next_page); set_error(''); set_notice(''); set_fields({}); set_mat_khau('');
    }

    async function submit_form(event) {
        event.preventDefault();
        if (pending) return;
        set_error(''); set_notice('');
        const errors = {};
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 254) errors.email = 'Vui lòng nhập email hợp lệ.';
        if (mat_khau.length < 8 || new TextEncoder().encode(mat_khau).length > 72) errors.mat_khau = 'Mật khẩu cần ít nhất 8 ký tự và không quá 72 byte UTF-8.';
        if (page === 'register' && (ho_ten.trim().length < 2 || ho_ten.trim().length > 150)) errors.ho_ten = 'Họ và tên cần từ 2 đến 150 ký tự.';
        set_fields(errors);
        if (Object.keys(errors).length) { document.getElementById(Object.keys(errors)[0])?.focus(); return; }
        set_pending(true);
        try {
            const data = await send_auth_request(page, { email: email.trim(), mat_khau, ...(page === 'register' ? { ho_ten: ho_ten.trim() } : {}) });
            set_mat_khau('');
            if (page === 'register') {
                window.history.replaceState({}, '', '/dang_nhap'); set_page('login'); set_notice(data.message);
            } else {
                set_account(data.account); window.history.replaceState({}, '', '/tai_khoan');
            }
        } catch (failure) { set_error(failure.message); set_fields(failure.fields ?? {}); }
        finally { set_pending(false); }
    }

    async function logout() {
        set_pending(true); set_error('');
        try {
            await send_auth_request('logout', {});
            set_account(null); set_page('login'); window.history.replaceState({}, '', '/dang_nhap'); set_notice('Bạn đã đăng xuất.');
        } catch (failure) {
            if (failure.status === 401) { set_account(null); set_notice('Phiên đăng nhập đã kết thúc.'); }
            else set_error(failure.message);
        } finally { set_pending(false); }
    }

    function render_field(name, label, type, value, update, autocomplete) {
        return <div className="form_field">
            <label htmlFor={name}>{label}</label>
            <input id={name} name={name} type={type} value={value} onChange={(event) => update(event.target.value)} autoComplete={autocomplete}
                disabled={pending} required aria-invalid={Boolean(fields[name])} aria-describedby={fields[name] ? `${name}_error` : undefined} />
            {fields[name] && <p className="field_error" id={`${name}_error`}>{fields[name]}</p>}
        </div>;
    }

    return <>
        <header className="site_header">
            <a className="brand_link" href="/dang_nhap" aria-label="DoctorSewa">{render_logo()}</a>
            <nav aria-label="Điều hướng chính"><span>TRANG CHỦ</span><span>DANH SÁCH BÁC SĨ/CHUYÊN KHOA</span><span>DỊCH VỤ / PHÒNG KHÁM</span></nav>
            {account ? <button className="header_button" onClick={logout} disabled={pending}>Đăng xuất</button> :
                <button className="header_button" onClick={() => navigate('register')} disabled={pending || loading}>Tạo tài khoản</button>}
        </header>
        <main className={`auth_main ${page === 'register' && !account ? 'registration' : ''}`}>
            {loading ? <p className="loading" role="status">Đang tải…</p> : account ?
                <section className="auth_card account_card" aria-labelledby="account_title">
                    <h1 id="account_title">Tài khoản của bạn</h1>
                    <p className="subtitle">Xin chào, {account.ho_ten}.</p>
                    <dl><dt>Họ và tên</dt><dd>{account.ho_ten}</dd><dt>Email</dt><dd>{account.email}</dd><dt>Vai trò</dt><dd>{role_names[account.vai_tro]}</dd></dl>
                    {error && <p className="form_error" role="alert">{error}</p>}
                    <button className="primary_button" onClick={logout} disabled={pending}>{pending ? 'Đang đăng xuất…' : 'Đăng xuất'}</button>
                </section> :
                <section className="auth_card" aria-labelledby="auth_title">
                    <h1 id="auth_title">{page === 'register' ? 'Tạo tài khoản' : 'Đăng nhập'}</h1>
                    <p className="subtitle">{page === 'register' ? 'Vui lòng đăng ký để đặt lịch hẹn.' : 'Vui lòng đăng nhập để đặt lịch hẹn.'}</p>
                    {notice && <p className="form_notice" role="status">{notice}</p>}
                    {error && <p className="form_error" role="alert">{error}</p>}
                    <form onSubmit={submit_form} noValidate aria-busy={pending}>
                        {page === 'register' && render_field('ho_ten', 'Họ và tên', 'text', ho_ten, set_ho_ten, 'name')}
                        {render_field('email', 'Email', 'email', email, set_email, 'username')}
                        {render_field('mat_khau', 'Mật khẩu', 'password', mat_khau, set_mat_khau, page === 'register' ? 'new-password' : 'current-password')}
                        <button className="primary_button" type="submit" disabled={pending}>{pending ? 'Đang xử lý…' : page === 'register' ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
                    </form>
                    {page === 'register' && <p className="switch_form">Bạn đã có tài khoản? <button type="button" onClick={() => navigate('login')} disabled={pending}>Đăng nhập tại đây</button></p>}
                </section>}
        </main>
    </>;
}
