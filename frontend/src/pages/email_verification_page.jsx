import {useState as use_state,useEffect as use_effect} from 'react';
import {send_auth_request} from '../services/auth_api.js';
import Form_field from '../components/form_field.jsx';

export default function email_verification_page({doctor=false}) {
    const [token]=use_state(()=>{
        const value=new URLSearchParams(window.location.hash.slice(1)).get('token')||'';
        return value;
    });
    use_effect(()=>{window.history.replaceState({},'',window.location.pathname);},[]);
    const [password,set_password]=use_state('');
    const [confirmation,set_confirmation]=use_state('');
    const [pending,set_pending]=use_state(false);
    const [error,set_error]=use_state('');
    const [notice,set_notice]=use_state('');
    async function confirm_email(event) {
        event.preventDefault();if(pending)return;
        set_error('');
        if(doctor&&password!==confirmation){set_error('Hai mật khẩu chưa khớp.');return;}
        set_pending(true);
        try {
            const result=await send_auth_request(`email/${doctor?'activate-doctor':'verify'}`,{token,...(doctor?{mat_khau:password}:{})});
            set_notice(result.message);set_password('');set_confirmation('');
        } catch(failure){set_error(failure.message);} finally{set_pending(false);}
    }
    return <main className="auth_main"><section className="auth_card"><h1>{doctor?'Kích hoạt tài khoản bác sĩ':'Xác minh email'}</h1>
        {notice?<><p className="form_notice" role="status">{notice}</p><a className="primary_button button_link" href="/dang_nhap">Đăng nhập</a></>:!token?<><p className="form_error" role="alert">Liên kết thiếu mã xác minh. Hãy mở lại liên kết trong email.</p><a href="/gui_lai_email">Yêu cầu gửi lại email</a></>:<form onSubmit={confirm_email} aria-busy={pending}>
            <p className="subtitle">{doctor?'Đặt mật khẩu riêng để hoàn tất xác minh email và kích hoạt tài khoản.':'Bấm nút bên dưới để xác nhận bạn sở hữu địa chỉ email này.'}</p>
            {doctor&&<><Form_field name="mat_khau" label="Mật khẩu mới" type="password" value={password} update={set_password} auto_complete="new-password" disabled={pending}/><Form_field name="xac_nhan_mat_khau" label="Nhập lại mật khẩu" type="password" value={confirmation} update={set_confirmation} auto_complete="new-password" disabled={pending}/></>}
            {error&&<p className="form_error" role="alert">{error}</p>}
            <button className="primary_button" disabled={pending}>{pending?'Đang xác minh…':doctor?'Kích hoạt tài khoản':'Xác minh email'}</button>
            <p className="switch_form"><a href="/gui_lai_email">Gửi lại email xác minh</a></p>
        </form>}
    </section></main>;
}
