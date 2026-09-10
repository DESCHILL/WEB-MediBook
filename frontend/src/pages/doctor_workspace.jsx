import {useState as use_state} from 'react';
import {use_catalog} from '../hooks/use_catalog.js';
import Request_state from '../components/request_state.jsx';
import Workspace_layout from '../components/workspace_layout.jsx';
const links=[['/bac_si/lich_hen','Quản lý lịch hẹn'],['/bac_si/benh_nhan','Danh sách bệnh nhân']];
function result_field({item,refresh}) {
    const [content,set_content]=use_state(item.ket_qua||'');
    const [pending,set_pending]=use_state(false);
    const [error,set_error]=use_state('');
    async function save_result(event) {
        event.preventDefault();set_pending(true);set_error('');
        try {
            const response=await fetch(`/api/doctor/appointments/${item.lich_hen_id}/result`,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({noi_dung:content})});
            if(!response.ok) throw new Error((await response.json()).message);
            refresh();
        } catch(failure) {set_error(failure.message);} finally {set_pending(false);}
    }
    if(!item.co_the_ghi_ket_qua) return <span className="examination_content">{item.ket_qua||'—'}</span>;
    return <form className="result_form" onSubmit={save_result}><textarea aria-label={`Kết quả khám của ${item.ho_ten}`} value={content} maxLength={4000} required disabled={pending} onChange={(e)=>set_content(e.target.value)}/><button className="soft_button" disabled={pending||!content.trim()}>{pending?'Đang lưu…':'Lưu kết quả'}</button>{error&&<p role="alert" className="form_error">{error}</p>}</form>;
}
const Result_field=result_field;
function doctor_content({path}) {
    const state=use_catalog('doctor/appointments');
    const [date,set_date]=use_state(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()));
    const patients=path==='/bac_si/benh_nhan';
    const items=state.data?.items||[];
    const day_items=items.filter((item)=>item.bat_dau_luc.slice(0,10)===date && item.trang_thai!=='Đã hủy');
    const format_time=(value)=>new Intl.DateTimeFormat('vi-VN',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Ho_Chi_Minh'}).format(new Date(value));
    return <><h1>{patients?'Danh sách bệnh nhân':'Quản lý lịch hẹn'}</h1><Request_state {...state}/>{patients ? <div className="table_scroll"><table className="workspace_table"><thead><tr><th>Mã BN</th><th>Tên bệnh nhân</th><th>Tuổi</th><th>Thời gian hẹn</th><th>Nhập kết quả khám</th><th>Trạng thái</th></tr></thead><tbody>{items.map((item)=><tr key={item.lich_hen_id}><td>{item.benh_nhan_id}</td><td>{item.ho_ten}</td><td>{item.tuoi??'—'}</td><td>{item.bat_dau_luc.slice(0,10)} · {format_time(item.bat_dau_luc)}</td><td><Result_field item={item} refresh={state.retry}/></td><td>{item.trang_thai}</td></tr>)}</tbody></table>{state.data&&items.length===0&&<p className="request_state">Chưa có bệnh nhân đặt lịch.</p>}</div> : <><label className="calendar_date">Ngày khám <input type="date" value={date} onChange={(e)=>set_date(e.target.value)}/></label><div className="doctor_calendar">{Array.from({length:24},(_,index)=>8*60+index*30).map((minute)=>{
        const time=`${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`;
        return <div className="calendar_row" key={time}><span>{time}</span><div>{day_items.filter((item)=>item.bat_dau_luc.slice(11,16)===time).map((item)=><a href="/bac_si/benh_nhan" key={item.lich_hen_id}>{item.ho_ten} · {item.trang_thai}</a>)}</div></div>;
    })}{day_items.filter((item)=>item.bat_dau_luc.slice(11,16)<'08:00'||item.bat_dau_luc.slice(11,16)>='20:00').map((item)=><div className="calendar_row" key={item.lich_hen_id}><span>{format_time(item.bat_dau_luc)}</span><a href="/bac_si/benh_nhan">{item.ho_ten}</a></div>)}</div></> }</>;
}
const Doctor_content=doctor_content;
export default function doctor_workspace({auth,path}) {
    return <Workspace_layout links={links} path={path}>{auth.loading?<p>Đang tải…</p>:!auth.account?<a href="/dang_nhap">Đăng nhập</a>:auth.account.vai_tro!=='BAC_SI'?<p>Bạn không có quyền truy cập trang bác sĩ.</p>:<Doctor_content path={path}/>}</Workspace_layout>;
}
