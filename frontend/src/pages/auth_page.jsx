import { useState as use_state } from 'react';
import { send_auth_request } from '../services/auth_api.js';
import Form_field from '../components/form_field.jsx';

export default function auth_page({ registration, auth }) {
    const [register, set_register] = use_state(registration);
    const [email, set_email] = use_state('');
    const [ho_ten, set_ho_ten] = use_state('');
    const [mat_khau, set_mat_khau] = use_state('');
    const [error, set_error] = use_state('');
    const [fields, set_fields] = use_state({});
    const [notice, set_notice] = use_state('');
    const [pending, set_pending] = use_state(false);
    const search = new URLSearchParams(window.location.search);
    const doctor_id = search.get('doctor');
    const next_path = search.get('next') === 'lich_hen' ? '/lich_hen' : /^[1-9]\d{0,18}$/.test(doctor_id || '') ? `/bac_si/${doctor_id}` : '/tai_khoan';
    async function submit_form(event) {
        event.preventDefault(); if (pending) return;
        set_error(''); set_notice('');
        const errors = {};
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 254) errors.email = 'Vui lòng nhập email hợp lệ.';
        if (mat_khau.length < 8 || new TextEncoder().encode(mat_khau).length > 72 || mat_khau.includes('\0')) errors.mat_khau = 'Mật khẩu cần ít nhất 8 ký tự và không quá 72 byte UTF-8.';
        if (register && (ho_ten.trim().length < 2 || ho_ten.trim().length > 150)) errors.ho_ten = 'Họ và tên cần từ 2 đến 150 ký tự.';
        set_fields(errors);
        if (Object.keys(errors).length) { document.getElementById(Object.keys(errors)[0])?.focus(); return; }
        set_pending(true);
        try {
            const data = await send_auth_request(register ? 'register' : 'login', { email: email.trim(), mat_khau, ...(register ? { ho_ten: ho_ten.trim() } : {}) });
            set_mat_khau('');
            if (register) { window.history.replaceState({}, '', '/dang_nhap'); set_register(false); set_notice(data.message); }
            else window.location.assign(data.account.vai_tro==='BAC_SI'?'/bac_si/lich_hen':data.account.vai_tro==='ADMIN'?'/quan_tri':next_path);
        } catch (failure) { set_error(failure.message); set_fields(failure.fields ?? {}); }
        finally { set_pending(false); }
    }
    if (auth.loading) return <main className="auth_main"><p role="status">Đang tải…</p></main>;
    if (auth.account) return <main className="auth_main"><section className="auth_card"><h1>Bạn đã đăng nhập</h1><p>{auth.account.ho_ten}</p><a className="primary_button button_link" href="/tai_khoan">Xem tài khoản</a><a className="back_link" href="/bac_si">Tìm bác sĩ</a></section></main>;
    return <main className={`auth_main ${register ? 'registration' : ''}`}><section className="auth_card" aria-labelledby="auth_title">
        <h1 id="auth_title">{register ? 'Tạo tài khoản' : 'Đăng nhập'}</h1><p className="subtitle">{register ? 'Vui lòng đăng ký để đặt lịch hẹn.' : 'Vui lòng đăng nhập để đặt lịch hẹn.'}</p>
        {notice && <p className="form_notice" role="status">{notice}</p>}{error && <p className="form_error" role="alert">{error}</p>}
        <form onSubmit={submit_form} noValidate aria-busy={pending}>
            {register && <Form_field name="ho_ten" label="Họ và tên" value={ho_ten} update={set_ho_ten} auto_complete="name" error={fields.ho_ten} disabled={pending} />}
            <Form_field name="email" label="Email" type="email" value={email} update={set_email} auto_complete="username" error={fields.email} disabled={pending} />
            <Form_field name="mat_khau" label="Mật khẩu" type="password" value={mat_khau} update={set_mat_khau} auto_complete={register ? 'new-password' : 'current-password'} error={fields.mat_khau} disabled={pending} />
            <button className="primary_button" disabled={pending}>{pending ? 'Đang xử lý…' : register ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
        </form>
        {register && <p className="switch_form">Bạn đã có tài khoản? <a href="/dang_nhap">Đăng nhập tại đây</a></p>}
        {!register && <p className="switch_form">Chưa nhận được email? <a href="/gui_lai_email">Gửi lại email xác minh</a></p>}
    </section></main>;
}
