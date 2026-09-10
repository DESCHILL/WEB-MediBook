import { use_catalog } from '../hooks/use_catalog.js';
import Doctor_card from '../components/doctor_card.jsx';
import Specialty_list from '../components/specialty_list.jsx';
import Request_state from '../components/request_state.jsx';

export default function home_page() {
    const specialties = use_catalog('specialties');
    const doctors = use_catalog('doctors?page_size=10');
    return <main className="public_main home_page">
        <section className="hero"><div className="hero_copy"><h1>Đặt lịch hẹn<br/>với các bác sĩ uy tín</h1><p>Tìm bác sĩ và chuyên khoa phù hợp với bạn.<br/>Chủ động chăm sóc sức khỏe mỗi ngày.</p><a className="white_button" href="/bac_si">Tìm bác sĩ <span aria-hidden="true">→</span></a></div>
            <svg className="hero_art" viewBox="515 58 343 347" preserveAspectRatio="xMaxYMax slice" role="img" aria-label="Đội ngũ bác sĩ"><image href="/assets/home_reference.png" width="960" height="1836" /></svg>
        </section>
        <section className="specialty_section"><h2>Tìm kiếm theo chuyên khoa</h2><p>Chọn chuyên khoa và tham khảo thông tin bác sĩ<br/>để tìm lựa chọn phù hợp với bạn.</p><Request_state {...specialties} empty={specialties.data?.items.length === 0} empty_message="Chưa có chuyên khoa để hiển thị." />{specialties.data && <Specialty_list items={specialties.data.items} />}</section>
        <section className="featured_section"><h2>Các bác sĩ để bạn tham khảo</h2><p>Tìm hiểu chuyên khoa, kinh nghiệm và thông tin khám của từng bác sĩ.</p><Request_state {...doctors} empty={doctors.data?.items.length === 0} empty_message="Chưa có bác sĩ để hiển thị." />
            <div className="doctor_grid home_doctor_grid">{doctors.data?.items.map((doctor) => <Doctor_card key={doctor.bac_si_id} doctor={doctor} />)}</div>
            <a className="soft_button more_button" href="/bac_si">Xem thêm</a>
        </section>
        <section className="join_banner"><div><h2>Chủ động chăm sóc<br/>sức khỏe của bạn</h2><a className="white_button" href="/dang_ky">Tạo tài khoản</a></div>
            <svg className="join_art" viewBox="570 1300 209 243" role="img" aria-label="Bác sĩ tư vấn"><image href="/assets/home_reference.png" width="960" height="1836" /></svg>
        </section>
    </main>;
}
