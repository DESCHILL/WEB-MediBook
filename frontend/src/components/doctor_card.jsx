import Doctor_portrait from './doctor_portrait.jsx';

export default function doctor_card({ doctor }) {
    return <a className="doctor_card" href={`/bac_si/${doctor.bac_si_id}`}>
        <Doctor_portrait doctor={doctor} />
        <div className="doctor_card_body"><span className="doctor_card_action">Xem hồ sơ</span><h3>{doctor.ho_ten}</h3><p>{doctor.ten_chuyen_khoa}</p></div>
    </a>;
}
