import Site_header from './components/site_header.jsx';
import Site_footer from './components/site_footer.jsx';
import Home_page from './pages/home_page.jsx';
import Specialty_page from './pages/specialty_page.jsx';
import Doctor_list_page from './pages/doctor_list_page.jsx';
import Doctor_detail_page from './pages/doctor_detail_page.jsx';
import Auth_page from './pages/auth_page.jsx';
import Account_page from './pages/account_page.jsx';
import Appointment_page from './pages/appointment_page.jsx';
import Doctor_workspace from './pages/doctor_workspace.jsx';
import { use_auth } from './hooks/use_auth.js';

export default function app() {
    const auth = use_auth();
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    const doctor_match = /^\/bac_si\/([^/]+)$/.exec(path);
    const auth_page = ['/dang_nhap', '/dang_ky'].includes(path);
    let page;
    if (path === '/') page = <Home_page />;
    else if (path === '/chuyen_khoa') page = <Specialty_page />;
    else if (path === '/bac_si') page = <Doctor_list_page search={window.location.search} />;
    else if(['/bac_si/lich_hen','/bac_si/benh_nhan'].includes(path)) page=<Doctor_workspace auth={auth} path={path}/>;
    else if (doctor_match) page = <Doctor_detail_page doctor_id={doctor_match[1]} auth={auth} />;
    else if (path === '/lich_hen') page = <Appointment_page auth={auth} />;
    else if (auth_page) page = <Auth_page registration={path === '/dang_ky'} auth={auth} />;
    else if (path === '/tai_khoan') page = <Account_page auth={auth} />;
    else page = <main className="public_main request_state"><h1>Không tìm thấy trang</h1><a className="soft_button" href="/">Về trang chủ</a></main>;
    return <><Site_header {...auth} path={path} />{auth.error && <p className="global_error" role="alert">{auth.error}</p>}{page}{!auth_page && <Site_footer />}</>;
}
