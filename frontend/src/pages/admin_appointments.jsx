import {useState as use_state} from 'react';
import {use_catalog} from '../hooks/use_catalog.js';
import {send_workspace_request} from '../services/workspace_api.js';
import Request_state from '../components/request_state.jsx';
export default function admin_appointments({recent=false}){
    const state=use_catalog('admin/appointments');const [confirm_id,set_confirm_id]=use_state('');const [pending,set_pending]=use_state(false);const [error,set_error]=use_state('');
    async function cancel_appointment(id){set_pending(true);set_error('');try{await send_workspace_request(`admin/appointments/${id}/cancel`);set_confirm_id('');state.retry();}catch(failure){set_error(failure.message);}finally{set_pending(false);}}
    const items=recent?state.data?.items.slice(0,5):state.data?.items;
    return <><h1>{recent?'Lịch hẹn gần đây':'Quản lý lịch hẹn'}</h1><Request_state {...state} empty={items?.length===0} empty_message="Chưa có lịch hẹn."/>{error&&<p className="form_error" role="alert">{error}</p>}{items?.map((item)=><article className="admin_appointment_row" key={item.lich_hen_id}><div><h2>{item.benh_nhan}</h2><p>SĐT: {item.so_dien_thoai||'Chưa cung cấp'}</p><p>{item.dia_chi||'Chưa cung cấp địa chỉ'}</p><p>{new Intl.DateTimeFormat('vi-VN',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Ho_Chi_Minh'}).format(new Date(item.bat_dau_luc))}</p></div><div><h2>{item.bac_si}</h2><p>{item.ten_chuyen_khoa}</p></div><div><p>{item.trang_thai}</p>{item.co_the_huy&&(confirm_id===item.lich_hen_id?<><button className="cancel_button" disabled={pending} onClick={()=>cancel_appointment(item.lich_hen_id)}>Xác nhận hủy</button><button className="soft_button" onClick={()=>set_confirm_id('')}>Giữ lịch</button></>:<button className="cancel_button" onClick={()=>set_confirm_id(item.lich_hen_id)}>Hủy lịch hẹn</button>)}</div></article>)}</>;
}
