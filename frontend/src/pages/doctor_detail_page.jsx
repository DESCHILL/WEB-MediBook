import { use_catalog } from '../hooks/use_catalog.js';
import Doctor_portrait from '../components/doctor_portrait.jsx';
import Doctor_card from '../components/doctor_card.jsx';
import Request_state from '../components/request_state.jsx';

function related_doctors({ doctor }) {
    const state = use_catalog(`doctors?chuyen_khoa_id=${doctor.chuyen_khoa_id}&page_size=6`);
    const items = state.data?.items.filter((item) => item.bac_si_id !== doctor.bac_si_id).slice(0, 5);
    return <section className="related_section"><h2>Các bác sĩ liên quan</h2><p>Tham khảo những bác sĩ cùng chuyên khoa.</p>
        <Request_state {...state} empty={items?.length === 0} empty_message="Chưa có bác sĩ khác trong chuyên khoa này." />
        <div className="doctor_grid home_doctor_grid">{items?.map((item) => <Doctor_card key={item.bac_si_id} doctor={item} />)}</div>
    </section>;
}
const Related_doctors = related_doctors;

export default function doctor_detail_page({ doctor_id }) {
    const state = use_catalog(`doctors/${doctor_id}`);
    const doctor = state.data?.doctor;
    return <main className="public_main doctor_detail_page">
        <a className="back_link" href="/bac_si">← Danh sách bác sĩ</a>
        <Request_state {...state} />
        {doctor && <><section className="doctor_profile" aria-label="Thông tin bác sĩ">
            <Doctor_portrait doctor={doctor} />
            <div className="doctor_info"><h1>{doctor.ho_ten}</h1>
                <div className="doctor_qualification"><span>{doctor.bang_cap || 'Bác sĩ'} · {doctor.ten_chuyen_khoa}</span>{doctor.kinh_nghiem && <span className="experience_badge">{doctor.kinh_nghiem}</span>}</div>
                <h2>Giới thiệu</h2><p className="doctor_bio">{doctor.gioi_thieu || 'Thông tin giới thiệu đang được cập nhật.'}</p>
                <p className="doctor_fee">Phí khám: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doctor.phi_kham)}</strong></p>
                <p>Địa chỉ khám: {doctor.dia_chi_kham || 'Đang cập nhật'}</p>
            </div>
        </section><Related_doctors doctor={doctor} /></>}
    </main>;
}
