import {useState as use_state} from 'react';
import {send_auth_request} from '../services/auth_api.js';
import Form_field from '../components/form_field.jsx';

export default function resend_email_page() {
    const [email,set_email]=use_state('');
    const [pending,set_pending]=use_state(false);
    const [notice,set_notice]=use_state('');
    const [error,set_error]=use_state('');
    async function resend_email(event){
        event.preventDefault();if(pending)return;
        set_pending(true);set_error('');set_notice('');
        try{const result=await send_auth_request('email/resend',{email});set_notice(result.message);}
        catch(failure){set_error(failure.message);}finally{set_pending(false);}
    }
    return <main className="auth_main"><section className="auth_card"><h1>Gửi lại email xác minh</h1><p className="subtitle">Nhập email đã đăng ký. Bác sĩ dùng email được Admin tạo tài khoản.</p>
        <form onSubmit={resend_email} aria-busy={pending}><Form_field name="email" label="Email" type="email" value={email} update={set_email} auto_complete="email" disabled={pending}/>
        {notice&&<p className="form_notice" role="status">{notice}</p>}{error&&<p className="form_error" role="alert">{error}</p>}
        <button className="primary_button" disabled={pending}>{pending?'Đang xử lý…':'Gửi email xác minh'}</button></form><p className="switch_form"><a href="/dang_nhap">Trở về đăng nhập</a></p>
    </section></main>;
}
