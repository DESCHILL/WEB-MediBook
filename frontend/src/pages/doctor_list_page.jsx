import { use_catalog } from '../hooks/use_catalog.js';
import Doctor_card from '../components/doctor_card.jsx';
import Request_state from '../components/request_state.jsx';

export default function doctor_list_page({ search = '' }) {
    const parameters = new URLSearchParams(search);
    const state = use_catalog(`doctors?${parameters}`);
    const data = state.data;
    function page_link(page) { const next = new URLSearchParams(parameters); next.set('page', String(page)); return `/bac_si?${next}`; }
    return <main className="public_main doctor_list_page">
        <h1 className="page_intro">Xem danh sách các bác sĩ chuyên khoa.</h1>
        <div className="catalog_layout">
            <aside className="specialty_sidebar"><a className="filter_option selected" href="/bac_si">Tất cả bác sĩ</a></aside>
            <section aria-label="Danh sách bác sĩ" aria-busy={state.loading}>
                <Request_state {...state} empty={data?.items.length === 0} empty_message="Chưa có bác sĩ phù hợp." />
                {data && <><div className="doctor_grid">{data.items.map((doctor) => <Doctor_card key={doctor.bac_si_id} doctor={doctor} />)}</div>
                    {data.total > data.page_size && <nav className="pagination" aria-label="Phân trang">
                        {data.page > 1 && <a className="soft_button" href={page_link(data.page - 1)}>Trang trước</a>}
                        <span>Trang {data.page} / {Math.ceil(data.total / data.page_size)}</span>
                        {data.page * data.page_size < data.total && <a className="soft_button" href={page_link(data.page + 1)}>Trang sau</a>}
                    </nav>}</>}
            </section>
        </div>
    </main>;
}
