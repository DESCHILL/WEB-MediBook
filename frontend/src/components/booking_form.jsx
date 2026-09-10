import { useState as use_state } from 'react';
import { use_catalog } from '../hooks/use_catalog.js';
import { send_appointment_request } from '../services/appointment_api.js';
import Request_state from './request_state.jsx';

export default function booking_form({ doctor_id, auth }) {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const [day, set_day] = use_state(today);
    const [slot_id, set_slot_id] = use_state('');
    const [pending, set_pending] = use_state(false);
    const [error, set_error] = use_state('');
    const state = use_catalog(`doctors/${doctor_id}/slots?ngay=${encodeURIComponent(day)}`);
    async function book_appointment(event) {
        event.preventDefault(); if (pending || !slot_id) return;
        if (!auth.account) { window.location.assign(`/dang_nhap?doctor=${doctor_id}`); return; }
        set_pending(true); set_error('');
        try { await send_appointment_request('', { khung_gio_id: slot_id }); window.location.assign('/lich_hen'); }
        catch (failure) { set_error(failure.message); set_slot_id(''); state.retry(); }
        finally { set_pending(false); }
    }
    return <section className="booking_section"><h2>Đặt lịch khám</h2><form onSubmit={book_appointment}>
        <label htmlFor="appointment_day">Ngày khám</label><input id="appointment_day" type="date" min={today} value={day} required disabled={pending} onChange={(event) => { set_day(event.target.value); set_slot_id(''); set_error(''); }} />
        <Request_state {...state} empty={state.data?.items.length === 0} empty_message="Chưa có khung giờ trống trong ngày này. Vui lòng chọn ngày khác." />
        <fieldset className="slot_options" disabled={pending}><legend>Khung giờ khám · 30 phút</legend>{state.data?.items.map((item) => <label key={item.khung_gio_id} className={slot_id === item.khung_gio_id ? 'selected_slot' : ''}><input type="radio" name="slot" value={item.khung_gio_id} checked={slot_id === item.khung_gio_id} onChange={() => set_slot_id(item.khung_gio_id)} />{new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(item.bat_dau_luc))}</label>)}</fieldset>
        {error && <p className="form_error" role="alert">{error}</p>}
        {auth.account && auth.account.vai_tro !== 'BENH_NHAN' ? <p>Đặt lịch dành cho tài khoản bệnh nhân.</p> : <button className="primary_button" disabled={!slot_id || pending || auth.loading}>{pending ? 'Đang đặt lịch…' : auth.account ? 'Đặt lịch hẹn' : 'Đăng nhập để đặt lịch'}</button>}
    </form></section>;
}
