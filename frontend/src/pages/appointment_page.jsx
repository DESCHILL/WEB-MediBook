import { useState as use_state } from 'react';
import { use_catalog } from '../hooks/use_catalog.js';
import { send_appointment_request } from '../services/appointment_api.js';
import Request_state from '../components/request_state.jsx';
import Doctor_portrait from '../components/doctor_portrait.jsx';

function appointment_list() {
    const state = use_catalog('appointments');
    const [pending, set_pending] = use_state('');
    const [confirm_id, set_confirm_id] = use_state('');
    const [error, set_error] = use_state('');
    const [notice, set_notice] = use_state('');
    async function cancel_appointment(id) {
        set_pending(id); set_error(''); set_notice('');
        try { await send_appointment_request(`/${id}/cancel`); set_confirm_id(''); set_notice('Đã hủy lịch hẹn.'); state.retry(); }
        catch (failure) { set_error(failure.message); state.retry(); }
        finally { set_pending(''); }
    }
    return <><Request_state {...state} empty={state.data?.items.length === 0} empty_message="Bạn chưa có lịch hẹn. Hãy chọn bác sĩ và khung giờ phù hợp." />
        {state.status === 401 && <a className="soft_button" href="/dang_nhap?next=lich_hen">Đăng nhập lại</a>}
        {error && <p role="alert" className="form_error">{error}</p>}{notice && <p role="status" className="form_notice">{notice}</p>}
        <div className="appointment_list">{state.data?.items.map((item) => <article className="appointment_row" key={item.lich_hen_id}>
            <Doctor_portrait doctor={item} /><div className="appointment_info">
                <h2><a href={`/bac_si/${item.bac_si_id}`}>{item.ho_ten}</a></h2><p>{item.ten_chuyen_khoa}</p>
                <p><strong>Địa chỉ:</strong></p><p>{item.dia_chi_kham || 'Đang cập nhật'}</p>
                <p><strong>Ngày và giờ:</strong> {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(item.bat_dau_luc))}</p>
                {item.ket_qua && <p className="examination_content"><strong>Kết quả khám:</strong> {item.ket_qua}</p>}
            </div><div className="appointment_actions"><span className={`appointment_status ${item.trang_thai === 'Đã khám' ? 'completed' : ''}`}>{item.trang_thai}</span>
                {item.co_the_huy && (confirm_id === item.lich_hen_id ? <div className="cancel_confirmation"><p>Hủy lịch hẹn này?</p><button className="cancel_button" disabled={Boolean(pending)} onClick={() => cancel_appointment(item.lich_hen_id)}>{pending ? 'Đang hủy…' : 'Xác nhận hủy'}</button><button className="soft_button" disabled={Boolean(pending)} onClick={() => set_confirm_id('')}>Giữ lịch</button></div> : <button className="cancel_button" onClick={() => set_confirm_id(item.lich_hen_id)}>Hủy lịch hẹn</button>)}
            </div></article>)}</div><a className="back_link" href="/bac_si">Tìm bác sĩ và đặt lịch</a></>;
}
const Appointment_list = appointment_list;
export default function appointment_page({ auth }) {
    return <main className="public_main appointment_page"><h1>Quản lý lịch hẹn</h1>
        {auth.loading ? <p role="status">Đang tải…</p> : !auth.account ? <section className="request_state"><p>Đăng nhập để xem và quản lý lịch hẹn của bạn.</p><a className="primary_button button_link" href="/dang_nhap?next=lich_hen">Đăng nhập</a><a className="back_link" href="/bac_si">Xem bác sĩ và chuyên khoa</a></section> : auth.account.vai_tro !== 'BENH_NHAN' ? <p>Trang này dành cho tài khoản bệnh nhân.</p> : <Appointment_list />}
    </main>;
}
