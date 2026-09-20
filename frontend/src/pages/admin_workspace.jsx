import {use_catalog} from '../hooks/use_catalog.js';
import Workspace_layout from '../components/workspace_layout.jsx';
import Request_state from '../components/request_state.jsx';
import Admin_appointments from './admin_appointments.jsx';
import Admin_doctors from './admin_doctors.jsx';
import Admin_doctor_form from './admin_doctor_form.jsx';
import Admin_specialties from './admin_specialties.jsx';
const links=[['/quan_tri','Tổng quan'],['/quan_tri/lich_hen','Lịch hẹn'],['/quan_tri/them_bac_si','Thêm bác sĩ'],['/quan_tri/bac_si','Danh sách bác sĩ'],['/quan_tri/chuyen_khoa','Quản lý chuyên khoa']];
function dashboard(){const state=use_catalog('admin/dashboard');return <><h1>Tổng quan</h1><Request_state {...state}/>{state.data&&<div className="dashboard_counts">{[['bac_si','Bác sĩ'],['lich_hen','Lịch hẹn'],['benh_nhan','Bệnh nhân']].map(([key,label])=><article key={key}><strong>{state.data[key]}</strong><span>{label}</span></article>)}</div>}<Admin_appointments recent/></>;}
const Dashboard=dashboard;
export default function admin_workspace({auth,path}){let page=path==='/quan_tri'?<Dashboard/>:path==='/quan_tri/lich_hen'?<Admin_appointments/>:path==='/quan_tri/bac_si'?<Admin_doctors/>:path==='/quan_tri/them_bac_si'?<Admin_doctor_form/>:path==='/quan_tri/chuyen_khoa'?<Admin_specialties/>:<p>Không tìm thấy trang.</p>;return <Workspace_layout links={links} path={path}>{auth.loading?<p>Đang tải…</p>:!auth.account?<a href="/dang_nhap">Đăng nhập</a>:auth.account.vai_tro!=='ADMIN'?<p>Bạn không có quyền quản trị.</p>:page}</Workspace_layout>;}
