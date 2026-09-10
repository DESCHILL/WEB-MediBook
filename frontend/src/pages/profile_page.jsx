import { useState as use_state } from 'react';
import { use_catalog } from '../hooks/use_catalog.js';
import Request_state from '../components/request_state.jsx';
function profile_form({profile}) {
    const [data,set_data]=use_state(profile);
    const [editing,set_editing]=use_state(false);
    const [pending,set_pending]=use_state(false);
    const [error,set_error]=use_state('');
    const [notice,set_notice]=use_state('');
    const [fields,set_fields]=use_state({});
    const labels={ho_ten:'Họ và tên',so_dien_thoai:'Số điện thoại',dia_chi:'Địa chỉ',gioi_tinh:'Giới tính',ngay_sinh:'Ngày sinh'};
    async function save_profile(event) {
        event.preventDefault();set_pending(true);set_error('');set_notice('');set_fields({});
        try {
            const body=Object.fromEntries(Object.keys(labels).map((key)=>[key,data[key]||'']));
            const response=await fetch('/api/profile',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
            const result=await response.json();
            if (!response.ok) {set_fields(result.fields||{});throw new Error(result.message);}
            set_data(result.profile);set_editing(false);set_notice('Đã lưu thông tin cá nhân.');
        } catch(failure) {set_error(failure.message);} finally {set_pending(false);}
    }
    return <section className="profile_content"><div className="profile_avatar" aria-hidden="true"><svg viewBox="0 0 80 80"><circle cx="40" cy="27" r="13" fill="white"/><path d="M14 66c0-28 52-28 52 0" fill="white"/></svg></div><h1>{data.ho_ten}</h1>
        <h2>THÔNG TIN LIÊN HỆ</h2><p className="profile_email">Email: {profile.email}</p>
        {error&&<p className="form_error" role="alert">{error}</p>}{notice&&<p className="form_notice" role="status">{notice}</p>}
        <form onSubmit={save_profile}>{Object.entries(labels).map(([key,label])=><div className="profile_field" key={key}><label htmlFor={key}>{label}</label>{editing ? key==='gioi_tinh' ? <select id={key} value={data[key]||''} disabled={pending} onChange={(e)=>set_data({...data,[key]:e.target.value})}><option value="">Chưa cung cấp</option>{['Nam','Nữ','Khác'].map((value)=><option key={value}>{value}</option>)}</select> : <input id={key} type={key==='ngay_sinh'?'date':'text'} value={data[key]||''} disabled={pending} onChange={(e)=>set_data({...data,[key]:e.target.value})} aria-invalid={Boolean(fields[key])}/> : <span>{data[key]||'Chưa cung cấp'}</span>}{fields[key]&&<p className="field_error">{fields[key]}</p>}</div>)}
        {editing ? <><button className="soft_button" type="submit" disabled={pending}>{pending?'Đang lưu…':'Lưu thông tin'}</button><button className="soft_button" type="button" disabled={pending} onClick={()=>{set_data(profile);set_editing(false);set_error('');}}>Hủy chỉnh sửa</button></> : <button className="soft_button" type="button" onClick={()=>{set_editing(true);set_notice('');}}>Chỉnh sửa</button>}
        </form></section>;
}
const Profile_form=profile_form;
export default function profile_page() {
    const state=use_catalog('profile');
    return <main className="public_main profile_page"><Request_state {...state}/>{state.data?.profile&&<Profile_form profile={state.data.profile}/>}</main>;
}
