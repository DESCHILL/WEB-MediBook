import { useState as use_state } from 'react';

export default function doctor_portrait({ doctor }) {
    const [failed_source, set_failed_source] = use_state(null);
    const source = doctor.anh_dai_dien;
    const safe = typeof source === 'string' && (/^\/[^/]/.test(source) || /^https:\/\//.test(source));
    return <div className="doctor_portrait">{safe && failed_source !== source ?
        <img src={source} alt={`Bác sĩ ${doctor.ho_ten}`} loading="lazy" referrerPolicy="no-referrer" onError={() => set_failed_source(source)} /> :
        <svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="64" r="30" fill="#bbc4eb"/><path d="M31 179v-38c0-48 118-48 118 0v38" fill="#b1bce7"/><path d="m67 108 23 49 23-49" fill="#fff"/><path d="M58 116v33a12 12 0 0 0 24 0v-13M121 123v20" fill="none" stroke="#7b8dc4" strokeWidth="5"/><circle cx="121" cy="149" r="9" fill="none" stroke="#7b8dc4" strokeWidth="5"/></svg>}</div>;
}
