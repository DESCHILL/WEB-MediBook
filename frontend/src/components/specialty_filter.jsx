import { use_catalog } from '../hooks/use_catalog.js';
import Request_state from './request_state.jsx';

export default function specialty_filter({ selected_id }) {
    const state = use_catalog('specialties');
    return <aside className="specialty_sidebar" aria-label="Lọc theo chuyên khoa">
        <a className={`filter_option ${!selected_id ? 'selected' : ''}`} href="/bac_si" aria-current={!selected_id ? 'true' : undefined}>Tất cả bác sĩ</a>
        <Request_state {...state} />
        {state.data?.items.map((specialty) => <a key={specialty.chuyen_khoa_id} className={`filter_option ${selected_id === specialty.chuyen_khoa_id ? 'selected' : ''}`}
            aria-current={selected_id === specialty.chuyen_khoa_id ? 'true' : undefined} href={`/bac_si?chuyen_khoa_id=${specialty.chuyen_khoa_id}`}>{specialty.ten_chuyen_khoa}</a>)}
    </aside>;
}
