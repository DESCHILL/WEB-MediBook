import { use_catalog } from '../hooks/use_catalog.js';
import Request_state from '../components/request_state.jsx';
import Specialty_list from '../components/specialty_list.jsx';

export default function specialty_page() {
    const state = use_catalog('specialties');
    return <main className="public_main"><section className="specialty_section">
        <h1>Tìm kiếm theo chuyên khoa</h1>
        <p>Chọn chuyên khoa để tìm bác sĩ phù hợp với nhu cầu của bạn.</p>
        <Request_state {...state} empty={state.data?.items.length === 0} empty_message="Chưa có chuyên khoa để hiển thị." />
        {state.data && <Specialty_list items={state.data.items} />}
    </section></main>;
}
